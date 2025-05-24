/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageMediaRequest } from './ImageMediaRequest';
import type { VideoMediaRequest } from './VideoMediaRequest';
export type AllMediaRequest = {
    images?: (Array<ImageMediaRequest> | null);
    videos?: (Array<VideoMediaRequest> | null);
    hasMedia?: boolean;
};

