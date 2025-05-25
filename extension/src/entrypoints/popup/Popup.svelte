<script lang="ts">
  import Counter from "@/lib/components/Counter.svelte";
  import FactDisplay from "@/lib/components/FactDisplay.svelte";
  // import FactDisplay from "@/lib/components/FactDisplay.no";
  import { sendMessage } from "@/lib/messaging";
  import { getBackendClient } from "@/lib/proxyservice/backend";
  import { FactCheckState } from "@/lib/proxyservice/factcheck_db";
  import { FactState } from "@/util/fact_state";
  const dashboardUrl = browser.runtime.getURL("/dashboard.html");
  import { ProgressRing } from "@skeletonlabs/skeleton-svelte";

  let isLoading = $state(false);
  let contentData: any = $state(null);
  let errorMessage = $state("");

  let factcheckResponse: Promise<any> | null = $state(null);

  let factcycle = $state(FactState.NONE);

  import { onMount } from "svelte";

  onMount(() => {
    const interval = setInterval(() => {
      const states = Object.values(FactState);
      const currentIndex = states.indexOf(factcycle);
      const nextIndex = (currentIndex + 1) % states.length;
      factcycle = states[nextIndex];
    }, 1000);

    return () => clearInterval(interval);
  });

  let apiResponse: any = $state(null);

  async function requestContent() {
    try {
      isLoading = true;
      errorMessage = "";

      // Get the active tab
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        throw new Error("No active tab found");
      }

      // Send message to content script

      const contentData = await sendMessage(
        "getPageContent",
        undefined,
        tab.id
      );
      console.log("Content received:", contentData);
    } catch (error) {
      console.error("Error requesting content:", error);
      errorMessage =
        error instanceof Error ? error.message : "Failed to get content";
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="p-4 min-w-[450px] min-h-[250px] grid grid-rows-[auto_1fr] gap-4">
  <h1 class="text-3xl font-bold">Popup</h1>

  <!-- Neon Pink (broke) -->
  <Counter
    class="card w-full max-w-md preset-filled-surface-100-900 p-4 text-center"
  />

  <section class="flex flex-col gap-2">
    <a href={dashboardUrl} target="_blank">Open Dashboard</a>

    <!-- Content Request Button -->
    <button
      class="btn variant-primary w-full"
      onclick={requestContent}
      disabled={isLoading}
    >
      {#if isLoading}
        Getting Content...
      {:else}
        Get Page Content
      {/if}
    </button>

    <button
      class="btn preset-filled-secondary-500 w-full flex flex-col"
      onclick={async () => {
        const backendClient = getBackendClient();
        const res = await backendClient.factcheck(
          "test",
          "https://example.com",
          "contenttest",
          "<p>Test content</p>"
        );
        console.log("Factcheck response:", res);
        apiResponse = res;
      }}
    >
      API Request<br />
      Current response: <br />
      <span class="text-wrap text-xs wrap-anywhere"
        >{apiResponse ? JSON.stringify(apiResponse) : "None"}</span
      >
    </button>

    {#if errorMessage}
      <div class="card preset-filled-error-500 p-2 text-center text-sm">
        Error: {errorMessage}
      </div>
    {/if}

    <FactDisplay state={FactState.NONE} />
    <FactDisplay state={FactState.LOADING} />
    <FactDisplay state={FactState.VALID} />
    <FactDisplay state={FactState.INVALID} />
    <FactDisplay state={FactState.UNKNOWN} />
    <FactDisplay state={factcycle} />

    {#if factcheckResponse}
      <div class="card preset-tonal-surface p-3 text-xs">
        <pre>{JSON.stringify(factcheckResponse, null, 2)}</pre>
      </div>
    {/if}

    {#if isLoading}
      <ProgressRing classes="animate-spin w-full" />
    {/if}

    {#if contentData}
      <div class="card preset-tonal-surface p-3 text-xs space-y-2">
        <div><strong>Title:</strong> {contentData.title}</div>
        <div>
          <strong>URL:</strong> <span class="break-all">{contentData.url}</span>
        </div>
        <div>
          <strong>Text Length:</strong>
          {contentData.text?.length || 0} characters
        </div>
      </div>
    {/if}
  </section>

  <!-- create a form to submit a message to the background script -->
  <form class="flex flex-col gap-2">
    <input type="text" name="message" placeholder="Message" class="input" />
    <button type="submit">Submit</button>
  </form>
</main>
