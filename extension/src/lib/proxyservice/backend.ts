import { defineProxyService } from "@webext-core/proxy-service";
import { BackendClient, FactCheckResult, Verdict } from "../api"
import {ok, err, Result} from "neverthrow";


function createApiRepo() {
    const backendClient = new BackendClient(
        {
            BASE: 'http://localhost:8000',
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

        async factcheckComment(comment: string): Promise<Result<FactCheckResult, Error>> {
            try {
                return ok({
                    score: 0.9,
                    verdict: Verdict.VALID,
                    check_result: "MOCK! This comment is factually correct.",
                    sources: [],
                    factoids: null,
                } as FactCheckResult); // Placeholder for actual implementation
                // return ok(await backendClient.default.factcheckHandleComment({
                //     comment,
                // }));
            } catch (error) {
                return err(Error("Failed to perform factcheck on comment", { cause: error }));
            }
        }
    }
}

export const [registerBackendClient, getBackendClient] = defineProxyService('BackendClient', createApiRepo);