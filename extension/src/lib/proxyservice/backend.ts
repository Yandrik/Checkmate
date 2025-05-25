import { defineProxyService } from "@webext-core/proxy-service";
import { BackendClient, FactCheckResult, Verdict } from "../api"
import {ok, err, Result} from "neverthrow";
import { SocialMediaDetails, VideoDetails } from "../social_media_interfaces";
import { PageContent } from "../messaging"

function createApiRepo() {
    const backendClient = new BackendClient(
        {
            BASE: 'http://localhost:8000',
            // BASE: 'http://localhost:8001',
            // BASE: 'https://checkmate.wildwolfwuff.de',
        }
    );

    return {
        async factcheck(content: PageContent): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.factcheckHandleFactCheck({
                    content: content.text,
                    title: content.title,
                    url: content.url,
                    html: content.html
                }))
            } catch (error) {
                return err(Error("Failed to perform factcheck", { cause: error }));
            }
        },

        async factcheckComment(comment: SocialMediaDetails): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.factcheckSocialmediaHandleFactCheckSocialmedia(comment))
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        },

        async factcheckVideo(video_details: VideoDetails): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.(video_details))
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        }
    }
}

export const [registerBackendClient, getBackendClient] = defineProxyService('BackendClient', createApiRepo);