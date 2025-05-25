<script lang="ts">
  import "../../app.css";
  import { extractYoutubeVideoDetailsFromDocument } from "@/lib/youtube_extract";
  import type { MediaDetailsRequest } from "@/lib/api/models/MediaDetailsRequest";
  import FactDisplay from "./FactDisplay.svelte";
  import { FactState, fromVerdict } from "@/util/fact_state";
  import { getFactCheckService } from "../proxyservice/factcheck";
  import { scale } from "svelte/transition";
  import CheckInformation from "./CheckInformation.svelte";
  import { FactCheckResult } from "../api";

  let hostElement: HTMLElement | null = null;
  let extractedDetails = $state<MediaDetailsRequest | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let factState = $state(FactState.NONE);
  let showInfo = $state(false);
  let response = $state<FactCheckResult | null>(null);

  async function handleClick() {
    if (factState !== FactState.NONE) {
      console.log(
        "Fact Check button clicked, but already in a state:",
        factState,
      );
      return;
    }
    if (isLoading) {
      console.log("Fact Check button clicked, but still loading details.");
      return;
    }

    isLoading = true;
    error = null;

    try {
      extractedDetails = await extractYoutubeVideoDetailsFromDocument();
      console.log("Extracted details:", extractedDetails);
    } catch (e: any) {
      console.error("Error extracting details in Svelte component:", e);
      error = e.message || "Failed to extract details.";
      isLoading = false;
      return;
    } finally {
      isLoading = false;
    }

    if (error) {
      console.log("Fact Check button clicked, but there was an error:", error);
      alert(`Error: ${error}`);
      return;
    }
    if (!extractedDetails) {
      console.log("Fact Check button clicked, but no details were extracted.");
      alert("Could not extract details.");
      return;
    }

    if (
      !extractedDetails.channel &&
      !extractedDetails.transcription_close_to_timestamp
    ) {
      console.warn("No content to fact-check.");
      alert("No content to fact-check.");
      return;
    }

    factState = FactState.LOADING;
    try {
      const res = await getFactCheckService().factcheck_video(extractedDetails);
      console.log("Fact check response:", res);
      response = res;
      factState = fromVerdict(res.verdict);
    } catch {
      console.error("Error calling fact check service:", error);
      factState = FactState.NONE;
      return;
    }
  }

  async function handleFactDisplayClick() {
    if (factState === FactState.NONE) handleClick();
    else if (factState === FactState.LOADING) {
      console.log("Fact check is still loading, please wait.");
    } else {
      showInfo = !showInfo; // Toggle the display of additional info
    }
  }
</script>

<button
  bind:this={hostElement}
  onclick={handleClick}
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
    classes="fixed top-12 right-4"
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
    top: 1rem !important;
    right: 1rem !important;
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
