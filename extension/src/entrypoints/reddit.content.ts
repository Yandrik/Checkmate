import '../app.css';
import RedditFactCheckButton from '@/lib/components/RedditFactCheckButton.svelte';
import RedditCommentFactCheckButton from '@/lib/components/RedditCommentFactCheckButton.svelte';
import { mount } from 'svelte';
import { defineContentScript } from 'wxt/sandbox';

function isPostDetailPage() {
    // Prüft auf typische Post-Detail-URLs wie /comments/...
    return /\/comments\/[a-z0-9]+/i.test(window.location.pathname);
}

export default defineContentScript({
    matches: [
        '*://*.reddit.com/*' // <-- Reddit hinzufügen
    ],
    runAt: 'document_idle',

    main() {
        console.log('Checkmate Reddit Svelte content script loaded');

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

            mount(RedditFactCheckButton, {
                target: buttonContainer,
                // props: { /* any props to pass to FactCheckButton */ }
            });

            console.log('Svelte FactCheckButton mounted in:', targetDiv);
        };

        const addFactCheckButtonToComment = (commentDiv: HTMLElement) => {
            // Duplikate verhindern
            if (commentDiv.querySelector('.checkmate-button-container')) {
                return;
            }

            // Ensure the target div can act as a positioning context
            if (getComputedStyle(commentDiv).position === 'static') {
                commentDiv.style.position = 'relative';
            }

            // Create a container for the Svelte component
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'checkmate-button-container'; // For identification
            commentDiv.appendChild(buttonContainer);

            mount(RedditCommentFactCheckButton, {
                target: buttonContainer,
                // props: { /* any props to pass to FactCheckButton */ }
            });

            console.log('Svelte FactCheckButton mounted in:', commentDiv);
        };

        const processPage = () => {
            if (isPostDetailPage()) {
                // Posts
                const targetDivs = document.querySelectorAll('shreddit-post');
                targetDivs.forEach(div => {
                    if (div instanceof HTMLElement) {
                        addFactCheckButtonToDiv(div);
                    }
                });

                // Comments
                const commentDivs = document.querySelectorAll('shreddit-comment');
                commentDivs.forEach(comment => {
                    if (comment instanceof HTMLElement) {
                        addFactCheckButtonToComment(comment);
                    }
                });
            }
        };

        // Initial run
        processPage();

        // Observer: Buttons nur auf Detailseiten einfügen
        const observer = new MutationObserver((mutationsList) => {
            if (!isPostDetailPage()) return;
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;

                            // Posts
                            if (element.matches('shreddit-post')) {
                                addFactCheckButtonToDiv(element);
                            }
                            element.querySelectorAll('shreddit-post').forEach(targetDiv => {
                                if (targetDiv instanceof HTMLElement) {
                                    addFactCheckButtonToDiv(targetDiv);
                                }
                            });

                            // Comments
                            if (element.matches('shreddit-comment')) {
                                addFactCheckButtonToComment(element);
                            }
                            element.querySelectorAll('shreddit-comment').forEach(commentDiv => {
                                if (commentDiv instanceof HTMLElement) {
                                    addFactCheckButtonToComment(commentDiv);
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