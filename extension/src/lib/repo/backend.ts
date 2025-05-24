import { defineProxyService } from "@webext-core/proxy-service";
import { BackendClient } from "../api"
import {ok, err} from "neverthrow";


function createApiRepo() {
    const backendClient = new BackendClient(
        {
            BASE: 'http://localhost:8000',
        }
    );

    return {
        async factcheck(title: string, url: string, content: string, html: string) {
            try {
            return ok(await backendClient.default.factcheckHandleFactCheck({
                title,
                url,
                content,
                html,
            }))
            } catch (error) {
                return err(error);
            }
        }
    }
}

export const [registerBackendClient, getBackendClient] = defineProxyService('BackendClient', createApiRepo);