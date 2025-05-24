import { defineProxyService } from "@webext-core/proxy-service";
import { BackendClient, FactCheckResult, Verdict } from "../api"
import {ok, err, Result} from "neverthrow";
import { TweetDetails } from "../twitter_extract";


function createApiRepo() {
    const backendClient = new BackendClient(
        {
            BASE: 'http://localhost:8000',
            // BASE: 'http://localhost:8001',
            // BASE: 'https://checkmate.wildwolfwuff.de',
        }
    );

    return {
        async factcheck(title: string, url: string, content: string, html: string): Promise<Result<FactCheckResult, Error>> {
            try {
            return ok(await backendClient.default.factcheckHandleFactCheck({
                title,
                url,
                content,
                html,
            }))
            } catch (error) {
                return err(Error("Failed to perform factcheck", { cause: error }));
            }
        },

        async factcheckComment(comment: TweetDetails): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok(await backendClient.default.factcheckSocialmediaHandleFactCheckSocialmedia(
                    {
                        allMedia: comment.allMedia,
                        content: comment.tweetContent,
                        displayName: comment.displayName,
                        isAd: comment.isAd,
                        platform: 'twitter',
                        quoted: comment.quotedTweet,
                        username: comment.username
                    }
                ))
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        }
    }
}

export const [registerBackendClient, getBackendClient] = defineProxyService('BackendClient', createApiRepo);