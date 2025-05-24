/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FactCheckSource } from './FactCheckSource';
export type Factoid = {
    start: number;
    end: number;
    text: string;
    verdict: boolean;
    check_result: string;
    sources: Array<FactCheckSource>;
};

