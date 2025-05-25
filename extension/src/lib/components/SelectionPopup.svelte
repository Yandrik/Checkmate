<script lang="ts">
  import "../../app.css";
  import FactDisplay from "./FactDisplay.svelte";
  import { FactState, fromVerdict } from "@/util/fact_state";
  import { getFactCheckService } from "../proxyservice/factcheck";
  import { scale, fade } from "svelte/transition";
  import CheckInformation from "./CheckInformation.svelte";
  import { FactCheckResult } from "../api";

  // Props
  const { selectedText, onClose } = $props<{
    selectedText: string;
    onClose: () => void;
  }>();

  // Svelte 5 Runes for state
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let factState = $state(FactState.NONE);
  let showInfo = $state(false);
  let response = $state<FactCheckResult | null>(null);

  async function handleFactCheck() {
    if (factState !== FactState.NONE) {
      console.log(
        "Fact Check button clicked, but already in a state:",
        factState
      );
      return;
    }
    if (isLoading) {
      console.log("Fact Check button clicked, but still loading.");
      return;
    }

    factState = FactState.LOADING;
    isLoading = true;
    error = null;

    try {
      // Use the simpler factcheck_text method for selected text
      const result = await getFactCheckService().factcheck_text(selectedText);

      if (typeof result === "object" && result !== null) {
        console.log("Selection fact check response:", result);
        response = result;
        factState = fromVerdict(result.verdict);
      } else {
        throw new Error(typeof result === "string" ? result : "Unknown error");
      }
    } catch (e: any) {
      console.error("Error performing selection fact check:", e);
      error = e.message || "Failed to perform fact check.";
      factState = FactState.NONE;
    } finally {
      isLoading = false;
    }
  }

  async function handleFactDisplayClick() {
    if (factState === FactState.NONE) {
      handleFactCheck();
    } else if (factState === FactState.LOADING) {
      console.log("Selection fact check is still loading, please wait.");
    } else {
      showInfo = !showInfo; // Toggle the display of additional info
    }
  }

  function handleClose() {
    onClose();
  }

  // Truncate text for display
  let displayText = $derived(
    selectedText.length > 50
      ? selectedText.substring(0, 50) + "..."
      : selectedText
  );
</script>

<div
  class="min-w-40 min-h-20 card bg drop-shadow-lg mycard"
  in:fade={{ duration: 200 }}
  out:fade={{ duration: 150 }}
>
  <div class="popup-header">
    <span class="italic text-sm selected-text" title={selectedText}
      >"{displayText}"</span
    >
    <button class="close-btn" onclick={handleClose} title="Close">×</button>
  </div>

  <button
    onclick={handleFactCheck}
    class="fact-check-btn"
    disabled={isLoading}
    style="width: {factState === FactState.NONE
      ? '120px'
      : '2rem'}; transition: width 0.3s ease;"
  >
    {#if factState === FactState.NONE}
      <span out:scale={{ duration: 200, start: 0 }}>Fact Check</span>
    {/if}
    <FactDisplay
      onclick={handleFactDisplayClick}
      state={factState}
      classes="fact-display h-4 w-4"
    />
  </button>

  {#if showInfo && response !== null}
    <div class="info-container">
      <CheckInformation
        {response}
        classes="check-info"
        state={factState}
        zindex={1000000}
      />
    </div>
  {/if}

  {#if error}
    <div class="error-message" in:fade={{ duration: 200 }}>
      {error}
    </div>
  {/if}
</div>

<style lang="postcss">
  .bg {
    background-color: rgb(38, 38, 38);
    color: white;
  }

  .mycard {
    padding: 8px;
  }

  .selection-popup {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px;
    min-width: 150px;
    max-width: 300px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
    font-size: 12px;
    z-index: 999999;
    position: relative;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    gap: 8px;
  }

  .selected-text {
    color: #999;
    font-size: 11px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: italic;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .close-btn:hover {
    background-color: #f0f0f0;
    color: #666;
  }

  .fact-check-btn {
    background-color: #161618ff;
    border: none;
    color: rgb(255, 255, 255);
    border-radius: 16px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: white;
    border-width: 2px;
    gap: 4px;
    transition:
      background-color 0.3s ease,
      width 0.3s ease;
    min-height: 24px;
  }

  .fact-check-btn:hover:not(:disabled) {
    background-color: #3e4246ff;
    transition: background-color 0.3s ease;
  }

  .fact-check-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .fact-display {
    z-index: 1000000;
  }

  .info-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    z-index: 1000000;
  }

  .check-info {
    position: relative !important;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    color: #d93025;
    font-size: 10px;
    margin-top: 4px;
    padding: 4px;
    background-color: #fce8e6;
    border: 1px solid #f28b82;
    border-radius: 4px;
  }
</style>
