/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FactCheckResult } from '../models/FactCheckResult';
import type { SearchRequest } from '../models/SearchRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * HandleFactCheck
     * @param requestBody
     * @returns FactCheckResult Document created, URL follows
     * @throws ApiError
     */
    public factcheckHandleFactCheck(
        requestBody: SearchRequest,
    ): CancelablePromise<FactCheckResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/factcheck',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request syntax or unsupported method`,
            },
        });
    }
    /**
     * HandleGet
     * @returns any Request fulfilled, document follows
     * @throws ApiError
     */
    public handleGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
        });
    }
}
