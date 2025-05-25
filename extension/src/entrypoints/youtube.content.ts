import '../app.css';
import YoutubeFactCheckButton from '@/lib/components/YoutubeFactCheckButton.svelte';
import YoutubeCommentFactCheckButton from '@/lib/components/YoutubeCommentFactCheckButton.svelte';
import { mount } from 'svelte';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
    matches: [
        '*://*.youtube.com/*'
    ],
    runAt: 'document_idle',

    main() {
        console.log('Checkmate Reddit Svelte content script loaded');

        const addFactCheckButtonToVideo = (actionsDiv: HTMLElement) => {
            // Duplikate verhindern
            if (actionsDiv.querySelector('.checkmate-button-container')) return;

            // Button-Container erzeugen
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'checkmate-button-container';

            // Button möglichst weit rechts einfügen
            actionsDiv.appendChild(buttonContainer);

            mount(YoutubeFactCheckButton, {
                target: buttonContainer,
            });
        };

        const addFactCheckButtonToComment = (commentDiv: HTMLElement) => {
            // Duplikate verhindern
            if (commentDiv.querySelector('.checkmate-button-container')) {
                return;
            }

            // Action Row suchen (dort sind Like/Dislike/Antworten)
            const actionRow = commentDiv.querySelector('#action-buttons, #toolbar, .ytd-comment-action-buttons-renderer');
            if (!actionRow) {
                // Fallback: direkt in den Kommentar, falls keine Action Row gefunden
                commentDiv.appendChild(createButtonContainer(commentDiv));
                return;
            }

            // Button-Container erzeugen und einfügen
            actionRow.appendChild(createButtonContainer(commentDiv));
        };
        function createButtonContainer(commentDiv: HTMLElement): HTMLElement {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'checkmate-button-container';
            mount(YoutubeCommentFactCheckButton, {
                target: buttonContainer,
                // props: { /* any props to pass to FactCheckButton */ }
            });
            return buttonContainer;
        }

        const processPage = () => {
            // Video
            const actionsDiv = document.querySelector('#actions');
            if (actionsDiv instanceof HTMLElement) {
                addFactCheckButtonToVideo(actionsDiv);
            }

            // Comments
            const commentThreads = document.querySelectorAll('ytd-comment-thread-renderer');
            commentThreads.forEach(comment => {
                if (comment instanceof HTMLElement) {
                    addFactCheckButtonToComment(comment);
                }
            });

            // Antwort-Kommentare (Replies)
            document.querySelectorAll('ytd-comment-view-model[is-reply], ytd-comment-renderer[is-reply]').forEach(reply => {
                if (reply instanceof HTMLElement) {
                    addFactCheckButtonToComment(reply);
                }
            });
        };

        // Initial run
        processPage();

        // Observer: Buttons nur auf Detailseiten einfügen
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;

                            // Video
                            if (element.id === 'actions') {
                                addFactCheckButtonToVideo(element);
                            }
                            element.querySelectorAll('#actions').forEach(actionsDiv => {
                                if (actionsDiv instanceof HTMLElement) {
                                    addFactCheckButtonToVideo(actionsDiv);
                                }
                            });

                            // Comments
                            if (element.matches('ytd-comment-thread-renderer')) {
                                addFactCheckButtonToComment(element);
                            }
                            element.querySelectorAll('ytd-comment-thread-renderer').forEach(commentDiv => {
                                if (commentDiv instanceof HTMLElement) {
                                    addFactCheckButtonToComment(commentDiv);
                                }
                            });

                            // Antwort-Kommentare (Replies)
                            if (element.matches('ytd-comment-view-model[is-reply], ytd-comment-renderer[is-reply]')) {
                                addFactCheckButtonToComment(element);
                            }
                            element.querySelectorAll('ytd-comment-view-model[is-reply], ytd-comment-renderer[is-reply]').forEach(replyDiv => {
                                if (replyDiv instanceof HTMLElement) {
                                    addFactCheckButtonToComment(replyDiv);
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