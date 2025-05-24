<script lang="ts">
  import "../../app.css";
  import { onMount } from "svelte";

  let hostElement: HTMLElement | null = null;

  onMount(() => {
    // Access the host element (the div this component is mounted into)
    // to potentially adjust its parent's style if needed,
    // though direct parent manipulation from child is not always ideal.
    // For now, we assume the parent 'cellInnerDiv' will have 'position: relative'
    // set by the content script.
  });

  function handleClick() {
    console.log(
      "Fact Check Svelte button clicked!",
      hostElement?.parentElement
    );
    // Add your fact-checking logic here
    // For example, extract text from the post:
    // const postText = hostElement?.parentElement?.innerText;
    // alert(`Post content: ${postText?.substring(0, 100)}...`);
  }
</script>

<button
  bind:this={hostElement}
  onclick={handleClick}
  class="absolute top-2 right-[4.6rem] z-[10000] px-1 py-2 factcheckbutton"
>
  Fact Check
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
