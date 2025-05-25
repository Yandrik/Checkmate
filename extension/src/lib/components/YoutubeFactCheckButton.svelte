<script lang="ts">
  import "../../app.css";
  import { onMount } from "svelte";
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
      error = e.message || "Failed to extract reddit post details.";
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

    if (!extractedDetails.channel && !extractedDetails.transcription_close_to_timestamp) {
      console.warn("No content to fact-check.");
      alert("No content to fact-check.");
      return;
    }

    factState = FactState.LOADING;
    try {
      const res =
        await getFactCheckService().factcheck_video(extractedDetails);
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
  class="absolute top right-[1.0rem] z-[10000] m-0 p-0 py-1 factcheckbutton flex flex-row items-center justify-center transition-[width]"
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

<style lang="postcss">
  :root {
    --color-primary-500: oklch(55.6% 0 0deg);
  }

  .factcheckbutton {
    background-color: black;
    border-color: gray;
    border-width: 1.2px;
    color: gray;
    border-radius: 9999rem;
    padding: 1.2rem 1.2rem;
    font-size: 1.2rem;
    font-weight: 400;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    margin-top: -50px;
  }
  .factcheckbutton:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  .factcheckbutton[title]:not(:disabled):hover {
    background-color: #c00000;
    color: white;
  }

  .ztop {
    z-index: 10000;
  }
</style>
