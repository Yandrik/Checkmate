/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FactCheckDetailsRequest } from '../models/FactCheckDetailsRequest';
import type { FactCheckResult } from '../models/FactCheckResult';
import type { MediaCommentDetailsRequest } from '../models/MediaCommentDetailsRequest';
import type { MediaDetailsRequest } from '../models/MediaDetailsRequest';
import type { SocialMediaDetailsRequest } from '../models/SocialMediaDetailsRequest';
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
        requestBody: FactCheckDetailsRequest,
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
     * HandleFactCheckMedia
     * @param requestBody
     * @returns FactCheckResult Document created, URL follows
     * @throws ApiError
     */
    public factcheckMediaHandleFactCheckMedia(
        requestBody: MediaDetailsRequest,
    ): CancelablePromise<FactCheckResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/factcheck/media',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request syntax or unsupported method`,
            },
        });
    }
    /**
     * HandleFactCheckMediaComment
     * @param requestBody
     * @returns FactCheckResult Document created, URL follows
     * @throws ApiError
     */
    public factcheckMediaCommentHandleFactCheckMediaComment(
        requestBody: MediaCommentDetailsRequest,
    ): CancelablePromise<FactCheckResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/factcheck/media/comment',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request syntax or unsupported method`,
            },
        });
    }
    /**
     * HandleFactCheckSocialmedia
     * @param requestBody
     * @returns FactCheckResult Document created, URL follows
     * @throws ApiError
     */
    public factcheckSocialmediaHandleFactCheckSocialmedia(
        requestBody: SocialMediaDetailsRequest,
    ): CancelablePromise<FactCheckResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/factcheck/socialmedia',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request syntax or unsupported method`,
            },
        });
    }
    /**
     * HandleFactCheckText
     * @param requestBody
     * @returns FactCheckResult Document created, URL follows
     * @throws ApiError
     */
    public factcheckTextHandleFactCheckText(
        requestBody: string,
    ): CancelablePromise<FactCheckResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/factcheck/text',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request syntax or unsupported method`,
            },
        });
    }
    /**
     * Health
     * @returns string Request fulfilled, document follows
     * @throws ApiError
     */
    public health(): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
        });
    }
}
