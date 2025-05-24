import '../app.css';
import FactCheckButton from '@/lib/components/FactCheckButton.svelte';
import { mount } from 'svelte';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['*://*.twitter.com/*', '*://x.com/*'],
  runAt: 'document_idle',

  main() {
    console.log('Checkmate Twitter Svelte content script loaded');


    function isActualTweet(div: HTMLElement): boolean {
      // Ad check: Look for "Ad" text or placement tracking attributes
      const isAdByPlacementTracking = div.querySelector('div[data-testid="placementTracking"]');
      if (isAdByPlacementTracking) {
        // console.log('Ad detected by placementTracking:', div);
        return false;
      }

      // Check for "Ad" text more broadly within the article context
      // This looks for a span with exactly "Ad" or "Promoted" as its text content.
      const adTextElements = div.querySelectorAll('article span');
      for (const span of Array.from(adTextElements)) {
        const text = span.textContent?.trim();
        if (text === 'Ad' || text === 'Promoted') {
          // A more robust check might involve checking parent elements or specific classes
          // to ensure it's a dedicated "Ad" label and not part of user content.
          // For now, this direct check is a starting point.
          // console.log(`Ad detected by text "${text}":`, div);
          return false;
        }
      }

      // Original structural checks, now scoped within the article to be more precise
      const articleElement = div.querySelector('article[role="article"]');
      if (!articleElement) return false;

      const hasTweetText = articleElement.querySelector('[data-testid="tweetText"]');
      const hasAvatar = articleElement.querySelector('[data-testid="Tweet-User-Avatar"]');
      // Engagement buttons are usually within the article
      const hasEngagementButtons = articleElement.querySelector('[data-testid="reply"]') &&
                                   articleElement.querySelector('[data-testid="like"]');
      // Timestamp link to the specific tweet status
      const hasTimestamp = articleElement.querySelector('a[href*="/status/"]');

      return !!(hasTweetText && hasAvatar && hasEngagementButtons && hasTimestamp);
    }

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
      targetDiv.appendChild(buttonContainer);

      mount(FactCheckButton, {
        target: buttonContainer,
        props: {
          tweetElement: targetDiv, // Pass the tweet's root HTML element
        }
      });

      console.log('Svelte FactCheckButton mounted in:', targetDiv);
    };

    const processPage = () => {
      const targetDivs = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
      targetDivs.forEach(div => {
        if (div instanceof HTMLElement) {
          if (isActualTweet(div)) {
            addFactCheckButtonToDiv(div);
          } else {
            // console.log('Not an actual tweet in processPage:', div);
          }
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
                if (isActualTweet(element)) {
                  console.log(`Actual tweet detected in observed element:`, element);
                  addFactCheckButtonToDiv(element);
                }
                // Optional: else console.log for not an actual tweet
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});