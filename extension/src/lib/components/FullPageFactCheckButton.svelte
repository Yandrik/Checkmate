<script lang="ts">
  import "../../app.css";
  import { browser } from "wxt/browser";
  import FactDisplay from "./FactDisplay.svelte";
  import { FactState, fromVerdict } from "@/util/fact_state";
  import { getFactCheckService } from "../proxyservice/factcheck";
  import { scale } from "svelte/transition";
  import CheckInformation from "./CheckInformation.svelte";
  import { FactCheckResult } from "../api";
  import { sendMessage } from "../messaging";
  import {
    FactCheckState,
    getFactCheckDbService,
  } from "../proxyservice/factcheck_db";
  import { Ok } from "neverthrow";

  // Props
  const { visible = true } = $props<{
    visible?: boolean;
  }>();

  // Svelte 5 Runes for state
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let factState = $state(FactState.NONE);
  let showInfo = $state(false);
  let response = $state<FactCheckResult | null>(null);

  async function onMountReadCached() {
    const tabId = await sendMessage("getCurrentTabId", undefined);
    if (tabId === -1) {
      console.error("Failed to retrieve current tab ID.");
      return;
    }
    const cached =
      await getFactCheckService().get_cached_factcheck_whole_page(tabId);
    if (cached !== null) {
      factState = fromVerdict(cached.verdict);
      response = cached;
    }
  }

  onMount(() => {
    onMountReadCached();
  });

  async function handleClick() {
    if (factState !== FactState.NONE) {
      console.log(
        "Full Page Fact Check button clicked, but already in a state:",
        factState
      );
      return;
    }
    if (isLoading) {
      console.log("Full Page Fact Check button clicked, but still loading.");
      return;
    }

    console.log("Full Page Fact Check button clicked!");

    factState = FactState.LOADING;
    isLoading = true;
    error = null;

    try {
      // Get current tab ID
      const tabId = await sendMessage("getCurrentTabId", undefined);
      if (tabId === -1) {
        throw new Error("Failed to retrieve current tab ID.");
      }
      const result = await getFactCheckService().factcheck_whole_page(tabId);

      if (typeof result === "object" && result !== null) {
        console.log("Full page fact check response:", result);
        response = result;
        factState = fromVerdict(result.verdict);
      } else {
        throw new Error(typeof result === "string" ? result : "Unknown error");
      }
    } catch (e: any) {
      console.error("Error performing full page fact check:", e);
      error = e.message || "Failed to perform full page fact check.";
      factState = FactState.NONE;
    } finally {
      isLoading = false;
    }
  }

  async function handleFactDisplayClick() {
    if (factState === FactState.NONE) handleClick();
    else if (factState === FactState.LOADING) {
      console.log("Full page fact check is still loading, please wait.");
    } else {
      showInfo = !showInfo; // Toggle the display of additional info
    }
  }
</script>

{#if visible}
  <button
    onclick={handleClick}
    class="ztop factcheckbutton"
    style="width: {factState === FactState.NONE
      ? '150px'
      : '1.8rem'}; transition: width 0.3s ease; height: 1.8rem;"
  >
    {#if factState === FactState.NONE}
      <span out:scale={{ duration: 200, start: 0 }}>Full Page Check</span>
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
{/if}

<style lang="postcss">
  :root {
    --color-primary-500: oklch(55.6% 0 0deg);
  }

  .factcheckbutton {
    all: unset !important;
    position: fixed !important;
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
