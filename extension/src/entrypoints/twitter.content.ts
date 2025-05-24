import '../app.css';
import FactCheckButton from '@/lib/components/FactCheckButton.svelte';
import { mount } from 'svelte';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['*://*.twitter.com/*', '*://x.com/*'],
  runAt: 'document_idle',

  main() {
    console.log('Checkmate Twitter Svelte content script loaded');

    const addFactCheckButtonToDiv = (targetDiv: HTMLElement) => {
      // Check if a button container already exists to avoid duplicates
      if (targetDiv.querySelector('.checkmate-button-container')) {
        return;
      }

      // Ensure the target div can act as a positioning context
      if (getComputedStyle(targetDiv).position === 'static') {
        targetDiv.style.position = 'relative';
      }

      // Create a container for the Svelte component
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'checkmate-button-container'; // For identification
      // The Svelte component itself will handle its absolute positioning relative to this container's parent (targetDiv)
      // So, this container doesn't need specific positioning styles itself unless desired for other reasons.
      targetDiv.appendChild(buttonContainer);

      mount(FactCheckButton, {
        target: buttonContainer,
        // props: { /* any props to pass to FactCheckButton */ }
      });

      console.log('Svelte FactCheckButton mounted in:', targetDiv);
    };

    const processPage = () => {
      const targetDivs = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
      targetDivs.forEach(div => {
        if (div instanceof HTMLElement) {
          addFactCheckButtonToDiv(div);
        }
      });
    };

    // Initial run
    processPage();

    // Observe DOM changes to add buttons to dynamically loaded content
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches('div[data-testid="cellInnerDiv"]')) {
                addFactCheckButtonToDiv(element);
              }
              element.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(targetDiv => {
                if (targetDiv instanceof HTMLElement) {
                  addFactCheckButtonToDiv(targetDiv);
                }
              });
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});