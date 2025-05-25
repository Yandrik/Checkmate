import { onMessage } from "@/lib/messaging";

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        // Function to get webpage content
        function getPageContent() {
            const content = {
                title: document.title,
                url: window.location.href,
                content: document.body.innerText.split(' ').slice(0, 10000).join(' '),
                html: document.documentElement.outerHTML
            };
            return content;
        }

        // Log content immediately when script loads
        // console.log('Content script loaded, current page content:', getPageContent());

        onMessage("getPageContent", (_) => {
            const content = getPageContent();
            console.log('Message received, returning page content:', content);
            return content;

        })


        console.log('Content script initialized and listening for messages');
    },
});