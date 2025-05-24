<script lang="ts">
    import "../../app.css";
    import { onMount } from "svelte";
    import { extractTruthsocialDetails } from "@/lib/truthsocial_extract";

    let hostElement: HTMLElement | null = null;

    onMount(() => {
        // Hier könntest du Styles am Parent anpassen, falls nötig.
    });

    function findTruthSocialRootElement(
        el: HTMLElement | null,
    ): HTMLElement | null {
        while (el) {
            if (
                el.classList?.contains("status__wrapper") &&
                el.hasAttribute("data-id")
            ) {
                return el;
            }
            if (el.classList?.contains("detailed-actualStatus")) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function handleClick(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        const postRoot = findTruthSocialRootElement(hostElement);
        if (!postRoot) {
            console.warn("Kein Truth Social Post Element gefunden!");
            return;
        }
        const details = extractTruthsocialDetails(postRoot);
        console.log("Truth Social Details:", details);
    }
</script>

<button
    bind:this={hostElement}
    on:click|stopPropagation|preventDefault={handleClick}
    class="absolute top-7 right-[2.0rem] z-[10000] px-1 py-2 factcheckbutton"
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
        height: 24px;
        min-height: 24px;
        max-height: 24px;
        line-height: 24px;
        padding: 0 0.75rem;
        font-size: 0.7rem;
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
    }
    .factcheckbutton:hover,
    .factcheckbutton:focus {
        background: #222;
        color: #fff;
        outline: none;
    }
</style>
