/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FactCheckSource } from './FactCheckSource';
import type { Factoid } from './Factoid';
import type { Verdict } from './Verdict';
export type FactCheckResult = {
    score: number;
    check_result: string;
    verdict: Verdict;
    sources: Array<FactCheckSource>;
    factoids?: (Array<Factoid> | null);
};

