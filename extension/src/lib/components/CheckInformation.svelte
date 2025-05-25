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
      default:
        return "default";
    }
  });
</script>

<div
  class="card {colors} min-w-48 p-2 {classes} text-sm"
  style="z-index: {zindex};"
>
  <span class="text-center"
    ><strong>{response.verdict}</strong> ({Math.min(
      Math.max(0, response.score),
      100
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
        class="chip border-[rgb(100, 200, 0)] border-2 p-1 rounded-full gap-1 m-1"
      >
        <span>{source.name}</span>
      </a>
    {/each}
  </div>
</div>