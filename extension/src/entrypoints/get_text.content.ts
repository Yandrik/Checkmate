export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        // Function to get webpage content
        function getPageContent() {
            const content = {
                title: document.title,
                url: window.location.href,
                text: document.body.innerText,
                html: document.documentElement.outerHTML
            };
            return content;
        }

        // Log content immediately when script loads
        console.log('Content script loaded, current page content:', getPageContent());

        // Listen for messages
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'getContent') {
                const content = getPageContent();
                console.log('Message received, returning page content:', content);
                sendResponse(content);
                return true; // Keep message channel open for async response
            }
        });

        console.log('Content script initialized and listening for messages');
    },
});