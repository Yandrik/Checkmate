<script lang="ts">
    import "../../app.css";
    import { extractTruthsocialDetails } from "@/lib/truthsocial_extract";
    import type { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";
    import FactDisplay from "./FactDisplay.svelte";
    import { FactState, fromVerdict } from "@/util/fact_state";
    import { getFactCheckService } from "../proxyservice/factcheck";
    import { scale } from "svelte/transition";
    import CheckInformation from "./CheckInformation.svelte";
    import { FactCheckResult } from "../api";

    let hostElement: HTMLElement | null = null;
    let extractedDetails = $state<SocialMediaDetailsRequest | null>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let factState = $state(FactState.NONE);
    let showInfo = $state(false);
    let response = $state<FactCheckResult | null>(null);

    function findTruthSocialRootElement(
        el: HTMLElement | null,
    ): HTMLElement | null {
        while (el) {
            if (
                el.classList?.contains("status__wrapper") &&
                el.hasAttribute("data-id")
            ) {
                return el;
            }
            if (el.classList?.contains("detailed-actualStatus")) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    async function handleClick(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();

        if (factState !== FactState.NONE) {
            console.log(
                "Fact Check button clicked, but already in a state:",
                factState,
            );
            return;
        }
        if (isLoading) {
            console.log(
                "Fact Check button clicked, but still loading details.",
            );
            return;
        }

        isLoading = true;
        error = null;

        try {
            const postRoot = findTruthSocialRootElement(hostElement);
            if (!postRoot)
                throw new Error("Keinen Truth-Social Post gefunden.");

            extractedDetails = extractTruthsocialDetails(postRoot);
            console.log("Extracted details:", extractedDetails);
        } catch (e: any) {
            console.error("Error extracting details in Svelte component:", e);
            error = e.message || "Failed to extract post details.";
            isLoading = false;
            return;
        } finally {
            isLoading = false;
        }

        if (error) {
            console.log(
                "Fact Check button clicked, but there was an error:",
                error,
            );
            alert(`Error: ${error}`);
            return;
        }
        if (!extractedDetails) {
            console.log(
                "Fact Check button clicked, but no details were extracted.",
            );
            alert("Could not extract details.");
            return;
        }

        if (!extractedDetails.username && !extractedDetails.content) {
            console.warn("No content to fact-check.");
            alert("No content to fact-check.");
            return;
        }

        factState = FactState.LOADING;
        try {
            const res =
                await getFactCheckService().factcheck_comment(extractedDetails);
            console.log("Fact check response:", res);
            response = res;
            factState = fromVerdict(res.verdict);
        } catch {
            console.error("Error calling fact check service:", error);
            factState = FactState.NONE;
            return;
        }
    }

    async function handleFactDisplayClick(event: MouseEvent) {
        if (factState === FactState.NONE) handleClick(event);
        else if (factState === FactState.LOADING) {
            console.log("Fact check is still loading, please wait.");
        } else {
            showInfo = !showInfo; // Toggle the display of additional info
        }
    }
</script>

<button
    bind:this={hostElement}
    on:click|stopPropagation|preventDefault={handleClick}
    class="ztop factcheckbutton"
    style="width: {factState === FactState.NONE
        ? '150px'
        : '1.8rem'}; transition: width 0.3s ease; height: 1.8rem;"
>
    {#if factState === FactState.NONE}
        <span out:scale={{ duration: 200, start: 0 }}>Fact Check</span>
    {/if}
    <FactDisplay
        onclick={handleFactDisplayClick}
        state={factState}
        classes="ztop h-5 w-5"
    />
</button>

{#if showInfo && response !== null}
    <CheckInformation
        {response}
        classes="absolute top-12 right-4"
        state={factState}
        zindex={10000000}
    />
{/if}

<style lang="postcss">
    :root {
        --color-primary-500: oklch(55.6% 0 0deg);
    }

    .factcheckbutton {
        all: unset !important;
        position: absolute !important;
        top: 0.1rem !important;
        right: 0.1rem !important;
        z-index: 10000 !important;
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        height: 32px !important; /* Feste Höhe */
        padding: 0 10px !important; /* Horizontaler Abstand */
        background-color: black !important;
        border: 1.5px solid gray !important;
        color: gray !important;
        border-radius: 9999px !important;
        font-size: 14px !important;
        font-family: Arial, sans-serif !important;
        font-weight: 500 !important;
        text-align: center !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition:
            background-color 0.3s,
            color 0.3s,
            width 0.3s !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        overflow: visible !important;
    }

    .factcheckbutton.icononly {
        width: 40px !important;
        height: 40px !important;
        padding: 0 !important;
        justify-content: center !important;
    }

    .factcheckbutton:disabled {
        cursor: not-allowed !important;
        opacity: 0.7 !important;
    }

    .factcheckbutton[title]:not(:disabled):hover {
        background-color: #c00000 !important;
        color: white !important;
    }

    .factcheckbutton svg {
        width: 24px !important;
        height: 24px !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .factcheckbutton span {
        margin-left: 8px !important;
        margin-right: 0 !important;
        white-space: nowrap !important;
        font-size: 14px !important;
        line-height: 1 !important;
    }

    .ztop {
        z-index: 10000;
    }
</style>
