import { defineProxyService } from "@webext-core/proxy-service";
import { ok, err, Result, Ok, Err } from "neverthrow";
import { sendMessage } from "../messaging";
import { getBackendClient } from "./backend";
import { FactCheckResult } from "../api";
import { FactCheckState, getFactCheckDbService } from "./factcheck_db";
import { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";
import { MediaDetailsRequest } from "@/lib/api/models/MediaDetailsRequest";
import { FactCheckDetailsRequest } from "@/lib/api/models/FactCheckDetailsRequest"

function createApiRepo() {

    const backendClient = getBackendClient();
    const factcheckDb = getFactCheckDbService();



    return {
        async get_cached_factcheck_whole_page(tabId: number): Promise<FactCheckResult | null> {
            const content = await sendMessage("getPageContent", undefined, tabId);
            if (content) {
                const factCheckDbEntry = await factcheckDb.getUrlFactCheck(content.url);
                if (factCheckDbEntry instanceof Ok && factCheckDbEntry.value) {
                    if (factCheckDbEntry.value.state === FactCheckState.DONE) {
                        return factCheckDbEntry.value!.result!;
                    } else if (factCheckDbEntry.value.state === FactCheckState.PENDING) {
                        return null; // Fact-check is still pending
                    }
                }
            }
            return null; // No cached fact-check found
        },
        async factcheck_whole_page(tabId: number): Promise<FactCheckResult | string> {
            const content = await sendMessage("getPageContent", undefined, tabId);
            if (content) {
                const factCheckDbEntry = await factcheckDb.getUrlFactCheck(content.url);
                if (factCheckDbEntry instanceof Ok && factCheckDbEntry.value) {
                    if (factCheckDbEntry.value.state === FactCheckState.DONE) {
                        return factCheckDbEntry.value!.result!;
                    } else if (factCheckDbEntry.value!.state === FactCheckState.PENDING) {
                        return "Fact-check is still pending";
                    }
                }

                await factcheckDb.setUrlFactCheck(content.url, FactCheckState.PENDING, new Date());

                console.log(content);
                const result = await backendClient.factcheck(content);
                console.log(result)

                if (typeof result === "object" && result !== null) {
                    await factcheckDb.setUrlFactCheck(content.url, FactCheckState.DONE, new Date(), result);
                    return result;
                } else {
                    await factcheckDb.setUrlFactCheck(content.url, FactCheckState.FAILED, new Date());
                    console.warn(err(new Error("Failed to perform fact-check", { cause: result })));
                    return "Failed to perform fact-check";
                }
            } else {
                return "Failed to retrieve content";
            }
        },

        async factcheck_section(title: string, url: string, text: string, tabId: number): Promise<Result<FactCheckResult, Error>> {
            const content: FactCheckDetailsRequest = {
                title: title,
                url: url,
                content: text,
                html: ""
            }
            const factCheckDbEntry = await factcheckDb.getUrlFactCheck(tabId.toString());
            if (factCheckDbEntry instanceof Ok && factCheckDbEntry.value) {
                if (factCheckDbEntry.value.state === FactCheckState.DONE) {
                    return ok(factCheckDbEntry.value!.result!);
                } else if (factCheckDbEntry.value.state === FactCheckState.PENDING) {
                    return err(new Error("Fact-check is still pending"));
                }
            }
            if (content) {
                const result = await backendClient.factcheck(content);

                if (typeof result === "object" && result !== null) {
                    await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.DONE, new Date(), result);
                    return ok(result);
                } else {
                    await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.FAILED, new Date());
                    return err(new Error("Failed to perform fact-check", { cause: result }));
                }
            }
            await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.FAILED, new Date());
            return err(new Error("Failed to retrieve content"));
        },

        async factcheck_comment(comment: SocialMediaDetailsRequest): Promise<FactCheckResult> {
            // await new Promise(resolve => setTimeout(resolve, 5000));
            try {
                const result = await backendClient.factcheckComment(comment)
                console.log(result);
                if (result.isOk()) {
                    return result.value;
                } else {
                    throw new Error("Failed to perform fact-check on comment", { cause: result });
                }
            } catch (error) {
                throw new Error("Failed to perform fact-check on comment", { cause: error });
            }
        },

        async factcheck_video(video_details: MediaDetailsRequest): Promise<FactCheckResult> {
            try {
                const result = await backendClient.factcheckVideo(video_details)
                console.log(result);
                if (result.isOk()) {
                    return result.value;
                } else {
                    throw new Error("Failed to perform fact-check on video details", { cause: result });
                }
            } catch (error) {
                throw new Error("Failed to perform fact-check on video details", { cause: error });
            }
        },

        async factcheck_text(text: string): Promise<FactCheckResult | string> {
            try {
                const result = await backendClient.factcheckText(text);
                console.log(result);
                if (result.isOk()) {
                    return result.value;
                } else {
                    return "Failed to perform fact-check on text";
                }
            } catch (error) {
                return "Failed to perform fact-check on text: " + error;
            }
        }
    }
}

export const [registerFactCheckService, getFactCheckService] = defineProxyService('FactCheckService', createApiRepo);
