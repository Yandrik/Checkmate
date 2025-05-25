<script lang="ts">
  import { FactState } from "@/util/fact_state";
  import "./FactStates.css";
  import { FactCheckResult } from "../api";

  interface Props {
    state: String;
    response: FactCheckResult;
    classes: String;
    zindex: number | undefined;
  }

  let { state, response, classes, zindex = 10000 }: Props = $props();

  let colors = $derived.by(() => {
    switch (state) {
      case FactState.VALID:
        return "valid";
      case FactState.INVALID:
        return "invalid";
      case FactState.UNKNOWN:
        return "unknown";
      case FactState.LOADING:
        return "loading";
      case FactState.PARTIALLY_VALID:
        return "partially_valid";
      default:
        return "default";
    }
  });
</script>

<div
  class="custom_font checkmate-reset card {colors} min-w-48 p-2 {classes} text-sm z-[2000000]"
  style="z-index: {zindex};"
>
  <span class="text-center"
    ><strong>{response.verdict}</strong> ({Math.min(
      Math.max(0, response.score),
      100,
    )}%)</span
  >
  <p class="text-left">
    <strong>reasoning:</strong><br />
    <span>{response.check_result}</span>
  </p>
  <div class="flex flex-row flex-wrap">
    {#each response.sources as source}
      <a
        href={source.link}
        class="custom_font chip {colors} border-2 p-1 rounded-full gap-1 m-1"
      >
        <span>{source.name}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .custom_font {
    font-size: 14px !important;
    font-family: Arial, sans-serif !important;
    font-weight: 500 !important;
  }

  .card {
    border-radius: 14px !important; /* größere, schönere Rundung */
    padding: 0.8em 1em !important; /* mehr Abstand innen */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .flex.flex-row.flex-wrap {
    margin-top: 0.8em !important;
  }

  .chip {
    padding: 0.3em 1em !important;
    border-color: currentColor !important;
  }

  
</style>
