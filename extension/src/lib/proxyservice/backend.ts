import { defineProxyService } from "@webext-core/proxy-service";
import { BackendClient, FactCheckResult, MediaDetailsRequest, Verdict } from "../api"
import { ok, err, Result } from "neverthrow";
import { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";
import { FactCheckDetailsRequest } from "@/lib/api/models/FactCheckDetailsRequest"

function createApiRepo() {
    const backendClient = new BackendClient(
        {
            BASE: 'http://localhost:8000',
            // BASE: 'http://localhost:8001',
            // BASE: 'https://checkmate.wildwolfwuff.de',
        }
    );

    return {
        async factcheck(content: FactCheckDetailsRequest): Promise<FactCheckResult | string> {
            try {
                return await backendClient.default.factcheckHandleFactCheck(content)
            } catch (error) {
                return "Failed to perform factcheck: " + error;
            }
        },

        async factcheckComment(comment: SocialMediaDetailsRequest): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.factcheckSocialmediaHandleFactCheckSocialmedia(comment))
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        },

        async factcheckVideo(video_details: MediaDetailsRequest): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.factcheckMediaHandleFactCheckMedia(video_details))
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        }
    }
}

export const [registerBackendClient, getBackendClient] = defineProxyService('BackendClient', createApiRepo);