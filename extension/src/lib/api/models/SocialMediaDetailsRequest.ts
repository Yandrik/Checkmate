/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AllMediaRequest } from './AllMediaRequest';
export type SocialMediaDetailsRequest = {
    username?: (string | null);
    displayName?: (string | null);
    content?: (string | null);
    allMedia?: (AllMediaRequest | null);
    isAd?: boolean;
    quoted?: (SocialMediaDetailsRequest | null);
    platform?: (string | null);
};

