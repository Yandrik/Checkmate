<script lang="ts">
  import "../../app.css";
  import { extractRedditDetailsFromElement } from "@/lib/reddit_extract";
  import FactDisplay from "./FactDisplay.svelte";
  import { FactState, fromVerdict } from "@/util/fact_state";
  import { getFactCheckService } from "../proxyservice/factcheck";
  import { Err } from "neverthrow";
  import { scale } from "svelte/transition";

  let hostElement: HTMLElement | null = null;
  let extractedDetails: any = null;
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let factState = $state(FactState.NONE);

  function findRedditRootElement(el: HTMLElement | null): HTMLElement | null {
    while (el) {
      if (el.tagName?.toLowerCase() === "shreddit-comment") {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

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
      const redditRoot = findRedditRootElement(hostElement);
      if (!redditRoot) throw new Error("Kein shreddit-comment gefunden!");

      extractedDetails = extractRedditDetailsFromElement(redditRoot);

      if (!extractedDetails || !extractedDetails.content) {
        console.warn(
          "FactCheckButton: Extracted details are sparse.",
          extractedDetails,
          "from element:",
          redditRoot,
        );
      }
    } catch (e: any) {
      console.error(
        "Error extracting tweet details in Svelte component:",
        e
      );
      error = e.message || "Failed to extract tweet details.";
      isLoading = false;
      return;
    } finally {
      isLoading = false;
    }

    factState = FactState.LOADING;

    const res = await getFactCheckService().factcheck_comment(
      extractedDetails.content,
    );

    if (res instanceof Err) {
      console.error("Fact check error:", res.error);
      const error = res.error;
      factState = FactState.NONE;
      return;
    } else {
      console.log("Fact check response:", res);
      factState = fromVerdict(res.value.verdict);
      console.log(factState);
    }
  }

  async function handleFactDisplayClick() {
    if (factState === FactState.NONE) handleClick();
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
    margin-top: -30px;
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
