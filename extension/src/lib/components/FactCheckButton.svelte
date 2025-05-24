<script lang="ts">
  import "../../app.css";
  import {
    extractTweetDetailsFromElement,
    type TweetDetails,
  } from "@/lib/twitter_extract";

  // Prop to receive the tweet's root HTML element
  const { tweetElement } = $props<{ tweetElement: HTMLElement }>();

  // Svelte 5 Runes for state
  let extractedDetails = $state<TweetDetails | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function handleClick() {
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
    console.log(
      "Fact Check Svelte button clicked!",
      `Username: ${extractedDetails.username}, Display Name: ${extractedDetails.displayName}, Tweet Content: ${extractedDetails.tweetContent}`,
      `All Media: ${JSON.stringify(extractedDetails.allMedia)}`,
      `Is Ad: ${extractedDetails.isAd}`,
      `Quoted Tweet: ${JSON.stringify(extractedDetails.quotedTweet)}`
    );
    // TODO: Add actual fact-checking logic
    // For example, send extractedDetails to a background script or API
  }
</script>

{#if isLoading}
  <button
    class="absolute top-2 right-[4.6rem] z-[10000] px-1 py-2 factcheckbutton"
    disabled
  >
    Loading...
  </button>
{:else if error}
  <button
    class="absolute top-2 right-[4.6rem] z-[10000] px-1 py-2 factcheckbutton"
    title={error}
    onclick={() => {
      error = null;
      extractedDetails = null;
      handleClick();
    }}
  >
    Retry
  </button>
{:else}
  <button
    onclick={handleClick}
    class="absolute top-2 right-[4.6rem] z-[10000] px-1 py-2 factcheckbutton"
  >
    Fact Check
  </button>
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
</style>
