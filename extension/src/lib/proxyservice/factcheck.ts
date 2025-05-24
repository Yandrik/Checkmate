import { defineProxyService } from "@webext-core/proxy-service";
import {ok, err, Result, Ok} from "neverthrow";
import { sendMessage } from "../messaging";
import { getBackendClient } from "./backend";
import { FactCheckResult } from "../api";
import { FactCheckState, getFactCheckDbService } from "./factcheck_db";


function createApiRepo() {

    const backendClient = getBackendClient();
    const factcheckDb = getFactCheckDbService();

    

    return {
        async factcheck_whole_page(tabId: number): Promise<Result<FactCheckResult, Error>> {
            const factCheckDbEntry = await factcheckDb.getUrlFactCheck(tabId.toString());
            if (factCheckDbEntry instanceof Ok) {
                if (factCheckDbEntry.value!.state === FactCheckState.DONE) {
                    return ok(factCheckDbEntry.value!.result!);
                } else if (factCheckDbEntry.value!.state === FactCheckState.PENDING) {
                    return err(new Error("Fact-check is still pending"));
                }
            }

            await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.PENDING, new Date());
            
            const content = await sendMessage("getPageContent", undefined, tabId);
            if (content) {
                const result = await backendClient.factcheck(
                    content.title,
                    content.url,
                    content.text,
                    content.html
                );

                if (result.isOk()) {
                    await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.DONE, new Date(), result.value);
                    return ok(result.value);
                } else {
                    await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.FAILED, new Date());
                    return err(new Error("Failed to perform fact-check", { cause: result.error }));
                }
            }
            await factcheckDb.setUrlFactCheck(tabId.toString(), FactCheckState.FAILED, new Date());
            return err(new Error("Failed to retrieve content"));
        },

        async factcheck_comment(comment: string): Promise<Result<FactCheckResult, Error>> {
            // await new Promise(resolve => setTimeout(resolve, 5000));
            const result = await backendClient.factcheckComment(comment)
            if (result.isOk()) {
                return ok(result.value);
            } else {
                return err(new Error("Failed to perform fact-check on comment", { cause: result.error }));
            }
        }

    }
}

export const [registerFactCheckService, getFactCheckService] = defineProxyService('FactCheckService', createApiRepo);
