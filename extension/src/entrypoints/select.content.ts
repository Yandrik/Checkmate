import '../app.css';
import SelectionPopup from '@/lib/components/SelectionPopup.svelte';
import { mount } from "svelte";

export default defineContentScript({
    allFrames: true,
    matches: ['*://*/*'],
    async main() {
        console.log('Selection fact-check content script loaded');

        let popupContainer: HTMLElement | null = null;
        let popupInstance: any = null;
        let initialScrollX = 0;
        let initialScrollY = 0;
        let popupBaseX = 0;
        let popupBaseY = 0;

        function createElementAtPosition(x: number, y: number): HTMLElement {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.zIndex = '999999';
            el.className = 'selection-factcheck-container';
            document.body.appendChild(el);
            return el;
        }

        function deletePopup() {
            if (popupContainer && popupContainer.className === 'selection-factcheck-container') {
                popupContainer.remove();
                popupContainer = null;
                popupInstance = null;
                // Reset scroll tracking variables
                initialScrollX = 0;
                initialScrollY = 0;
                popupBaseX = 0;
                popupBaseY = 0;
            }
        }

        function handleSelection(e: MouseEvent | TouchEvent) {
            // Don't interfere if clicking on our own popup
            if (popupContainer && popupContainer.contains(e.target as Node)) {
                return;
            }

            // Remove existing popup
            deletePopup();

            setTimeout(() => {
                const selection = window.getSelection()?.toString().trim().replace(/^-+|-+$/g, '');

                if (selection && selection.length > 10) { // Only show for selections longer than 10 chars
                    let position: { x: number; y: number };

                    if (e instanceof MouseEvent) {
                        position = { x: e.pageX + 20, y: e.pageY + 20 };
                    } else {
                        // Touch event
                        const touch = e.changedTouches[0];
                        position = { x: touch.pageX + 20, y: touch.pageY + 20 };
                    }

                    // Ensure popup doesn't go off-screen
                    const maxX = window.innerWidth + window.scrollX - 200;
                    const maxY = window.innerHeight + window.scrollY - 100;

                    position.x = Math.min(position.x, maxX);
                    position.y = Math.min(position.y, maxY);

                    // Store initial scroll position and popup base coordinates
                    initialScrollX = window.scrollX;
                    initialScrollY = window.scrollY;
                    popupBaseX = position.x;
                    popupBaseY = position.y;

                    popupContainer = createElementAtPosition(position.x, position.y);

                    try {
                        popupInstance = mount(SelectionPopup, {
                            target: popupContainer,
                            props: {
                                selectedText: selection,
                                onClose: deletePopup
                            }
                        });
                    } catch (error) {
                        console.error('Error mounting SelectionPopup:', error);
                        deletePopup();
                    }
                }
            }, 10); // Small delay to ensure selection is complete
        }

        // Event listeners for selection detection
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection);

        // Update popup position on scroll to follow the content
        function updatePopupPosition() {
            if (popupContainer) {
                const currentScrollX = window.scrollX;
                const currentScrollY = window.scrollY;

                const deltaX = currentScrollX - initialScrollX;
                const deltaY = currentScrollY - initialScrollY;

                const newX = popupBaseX + deltaX;
                const newY = popupBaseY + deltaY;

                popupContainer.style.left = `${newX}px`;
                popupContainer.style.top = `${newY}px`;
            }
        }

        // Update popup position on scroll
        document.addEventListener('scroll', updatePopupPosition, true);

        // Update popup position on window resize
        window.addEventListener('resize', updatePopupPosition);
    }
});