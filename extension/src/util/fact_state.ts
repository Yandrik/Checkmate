import { Verdict } from "@/lib/api/models/Verdict";

export enum FactState {
    NONE = "NONE",
    LOADING = "LOADING",
    VALID = "VALID",
    INVALID = "INVALID",
    UNKNOWN = "UNKNOWN",
}

export function fromVerdict(verdict: Verdict | string): FactState {
    if (typeof verdict === "string") {
        // Handle the case where verdict is a string
        switch (verdict.toLowerCase().trim()) {
            case "valid":
                return FactState.VALID;
            case "invalid":
                return FactState.INVALID;
            case "partially valid":
            case "partially_valid":
                return FactState.UNKNOWN;
            case "unsure":
                return FactState.UNKNOWN;
            default:
                return FactState.NONE;
        }
    }

    switch (verdict) {
        case Verdict.VALID:
            return FactState.VALID;
        case Verdict.INVALID:
            return FactState.INVALID;
        case Verdict.PARTIALLY_VALID:
            return FactState.UNKNOWN;
        case Verdict.UNSURE:
            return FactState.UNKNOWN;
        default:
            return FactState.NONE;
    }
}