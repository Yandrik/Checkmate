<script lang="ts">
  import { FactState } from "@/util/fact_state";
  import TablerListSearch from "~icons/tabler/list-search";
  import TablerCheck from "~icons/tabler/check";
  import TablerExclamationMark from "~icons/tabler/exclamation-mark";
  import TablerQuestionMark from "~icons/tabler/question-mark";
  import TablerAB from "~icons/tabler/a-b";
  import { ProgressRing } from "@skeletonlabs/skeleton-svelte";
  import { crossfade } from "svelte/transition";
  import "./FactStates.css";

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

  let {
    classes = "",
    spinner_classes = "",
    state = FactState.NONE,
    ...rest
  } = $props();
</script>

<button
  class="btn btn-icon {classes} aspect-square p-1 rounded-full transition-colors hover:brightness-110 {colors} z-[100000] width-24px height-24px margin-0 padding-0"
  {...rest}
>
  {#if state === FactState.LOADING}
    <div class="w-full">
      <ProgressRing classes="animate-spin w-full {spinner_classes}" />
    </div>
  {:else if state === FactState.VALID}
    <TablerCheck />
  {:else if state === FactState.INVALID}
    <TablerExclamationMark />
  {:else if state === FactState.PARTIALLY_VALID}
    <TablerAB />
  {:else if state === FactState.UNKNOWN}
    <TablerQuestionMark />
  {:else}
    <TablerListSearch />
  {/if}
</button>

