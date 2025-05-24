<script lang="ts">
  import "../../app.css";
  import { onMount } from "svelte";
  import { extractYoutubeVideoDetailsFromDocument } from "@/lib/youtube_extract";

  let hostElement: HTMLElement | null = null;

  onMount(() => {
    // Access the host element (the div this component is mounted into)
    // to potentially adjust its parent's style if needed,
    // though direct parent manipulation from child is not always ideal.
    // For now, we assume the parent 'cellInnerDiv' will have 'position: relative'
    // set by the content script.
  });

  async function handleClick() {
    const details = await extractYoutubeVideoDetailsFromDocument();
    console.log(details);
    //const details = extractRedditDetailsFromElement(redditRoot);
    //console.log("Reddit Details:", details);
  }
</script>

<button
  bind:this={hostElement}
  onclick={handleClick}
  class="absolute top right-[1rem] z-[10000] px-1 py-2 factcheckbutton"
>
  Fact Check
</button>

<style lang="postcss">
  :root {
    --color-primary-500: oklch(55.6% 0 0deg);
  }

  .factcheckbutton {
    background: #111;
    color: #fff;
    border: none;
    border-radius: 9999px;
    height: 30px;
    min-height: 30px;
    max-height: 30px;
    line-height: 30px;
    padding: 0 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
    user-select: none;
    padding-inline: 1rem;
    margin-top: -50px;
  }
  .factcheckbutton:hover,
  .factcheckbutton:focus {
    background: #222; /* Etwas heller beim Hover */
    color: #fff;
    outline: none;
  }

  .btn {
    border-radius: var(--radius-base) /* 0.25rem = 4px */;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
    text-decoration-line: none;
    white-space: nowrap;
    font-size: var(--text-base)
      /* calc(1rem * var(--text-scaling)) = calc(16px * var(--text-scaling)) */;
    line-height: var(--text-base--line-height)
      /* calc(calc(1.5 / 1) ≈ 1.5 * var(--text-scaling)) */;
    padding-block: calc(var(--spacing) * 1) /* 0.25rem = 4px */;
    padding-inline: calc(var(--spacing) * 4) /* 1rem = 16px */;
    transition-property: all;
    transition-timing-function: var(--default-transition-timing-function)
      /* cubic-bezier(0.4, 0, 0.2, 1) */;
    transition-duration: var(--default-transition-duration) /* 150ms */;
    &:hover {
      @media (hover: hover) {
        filter: brightness(125%);
        @media (prefers-color-scheme: dark) {
          filter: brightness(75%);
        }
      }
    }
  }
  .preset-outlined-primary-500 {
    border-width: 1px;
    border-color: var(--color-primary-500) /* oklch(55.6% 0 0deg) = #737373 */;
  }

  /* You can add component-specific styles here if needed,
     or rely on Tailwind classes passed via props or applied directly.
     The inline styles are for quick demonstration as requested. */
</style>
