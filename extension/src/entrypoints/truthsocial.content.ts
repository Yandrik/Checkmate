import '../app.css';
import TruthsocialFactCheckButton from '@/lib/components/TruthsocialFactCheckButton.svelte';
import { mount } from 'svelte';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
    matches: [
        '*://truthsocial.com/*'
    ],
    runAt: 'document_idle',

    main() {
        console.log('Checkmate Truth Social Svelte content script loaded');

        const addFactCheckButtonToDiv = (targetDiv: HTMLElement) => {
            if (targetDiv.querySelector('.checkmate-button-container')) {
                return;
            }
            if (getComputedStyle(targetDiv).position === 'static') {
                targetDiv.style.position = 'relative';
            }
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'checkmate-button-container';
            targetDiv.appendChild(buttonContainer);

            mount(TruthsocialFactCheckButton, {
                target: buttonContainer,
            });

            console.log('Svelte TruthSocialFactCheckButton mounted in:', targetDiv);
        };

        const processPage = () => {
            // Passe die Selektoren an die echten Truth Social-Komponenten an!
            const postDivs = document.querySelectorAll('.status__wrapper[data-id], .detailed-actualStatus');
            postDivs.forEach(div => {
                if (div instanceof HTMLElement) {
                    addFactCheckButtonToDiv(div);
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
                            if (element.matches('.status__wrapper[data-id], .detailed-actualStatus')) {
                                addFactCheckButtonToDiv(element);
                            }
                            element.querySelectorAll('.status__wrapper[data-id], .detailed-actualStatus').forEach(targetDiv => {
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