<script lang="ts">
  import "../../app.css";
  import { browser } from "wxt/browser";
  import {
    extractTweetDetailsFromElement,
    type TweetDetails,
  } from "@/lib/twitter_extract";
  import FactDisplay from "./FactDisplay.svelte";
  import { FactState, fromVerdict } from "@/util/fact_state";
  import { getFactCheckService } from "../proxyservice/factcheck";
  import { Err, Ok, Result } from "neverthrow";
  import { scale } from "svelte/transition";
  import CheckInformation from "./CheckInformation.svelte";
  import { FactCheckResult } from "../api";

  // Prop to receive the tweet's root HTML element
  const { tweetElement } = $props<{ tweetElement: HTMLElement }>();

  // Svelte 5 Runes for state
  let extractedDetails = $state<TweetDetails | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let factState = $state(FactState.NONE);
  let showInfo = $state(false);
  let response = $state<FactCheckResult | null>(null);

  async function handleClick() {
    if (factState !== FactState.NONE) {
      console.log(
        "Fact Check button clicked, but already in a state:",
        factState
      );
      return;
    }
    if (isLoading) {
      console.log("Fact Check button clicked, but still loading details.");
      return;
    }

    // Extract details on demand
    if (!extractedDetails) {
      isLoading = true;
      error = null;

      try {
        if (!tweetElement) {
          throw new Error("Tweet element not provided.");
        }

        extractedDetails = await extractTweetDetailsFromElement(tweetElement);

        if (!extractedDetails.username && !extractedDetails.tweetContent) {
          console.warn(
            "FactCheckButton: Extracted details are sparse.",
            extractedDetails,
            "from element:",
            tweetElement
          );
        }
      } catch (e: any) {
        console.error(
          "Error extracting tweet details in Svelte component:",
          e,
          "for element:",
          tweetElement
        );
        error = e.message || "Failed to extract tweet details.";
        isLoading = false;
        return;
      } finally {
        isLoading = false;
      }
    }

    if (error) {
      console.log("Fact Check button clicked, but there was an error:", error);
      alert(`Error: ${error}`);
      return;
    }
    if (!extractedDetails) {
      console.log("Fact Check button clicked, but no details were extracted.");
      alert("Could not extract tweet details.");
      return;
    }
    console.log("Fact Check Svelte button clicked!", extractedDetails);

    if (!extractedDetails.tweetContent) {
      console.warn("No tweet content to fact-check.");
      alert("No tweet content to fact-check.");
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
  onclick={handleClick}
  class="absolute top-2 right-[4.6rem] z-[9999] m-0 p-0 py-1 factcheckbutton flex flex-row items-center justify-center transition-[width]"
  style="width: {factState === FactState.NONE
    ? '110px'
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
    background-color: black;
    border-color: gray;
    border-width: 1.2px;
    color: gray;
    border-radius: 9999rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
  }
  .factcheckbutton:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  .factcheckbutton[title]:not(:disabled):hover {
    /* Style for error button on hover */
    background-color: #c00000; /* Darker red for error indication */
    color: white;
  }

  .ztop {
    z-index: 10000;
  }
</style>
