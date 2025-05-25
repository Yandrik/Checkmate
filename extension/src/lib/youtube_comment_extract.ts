  import type { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";

export function extractYoutubeCommentDetailsFromElement(element: HTMLElement): SocialMediaDetailsRequest {
    // Immer die Daten des aktuellen Elements extrahieren!
    const authorElem = element.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
    const author = authorElem?.textContent?.trim() || null;

    const contentElem = element.querySelector('#content-text');
    const content = contentElem?.textContent?.trim() || null;

    const channelLink = element.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
    const channelUrl = channelLink instanceof HTMLAnchorElement ? channelLink.href : null;

    // quoted: Nur für Antworten (is-reply)
    let quoted: SocialMediaDetailsRequest | null = null;
    if (element.hasAttribute('is-reply')) {
        // Parent-Kommentar suchen: vorangehendes ytd-comment-view-model im Thread
        const thread = element.closest('ytd-comment-thread-renderer');
        if (thread) {
            const parentComment = thread.querySelector('ytd-comment-view-model:not([is-reply]), ytd-comment-renderer:not([is-reply])');
            if (parentComment) {
                const parentAuthorElem = parentComment.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
                const parentAuthor = parentAuthorElem?.textContent?.trim() || null;
                const parentContentElem = parentComment.querySelector('#content-text');
                const parentContent = parentContentElem?.textContent?.trim() || null;
                const parentChannelLink = parentComment.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
                const parentChannelUrl = parentChannelLink instanceof HTMLAnchorElement ? parentChannelLink.href : null;

                quoted = {
                    platform: 'YouTube Comment',
                    username: parentChannelUrl,
                    displayName: parentAuthor,
                    content: parentContent,
                    allMedia: null,
                    isAd: false,
                    quoted: null
                };
            }
        }
    }

    return {
        platform: 'YouTube Comment',
        username: channelUrl,
        displayName: author,
        content,
        allMedia: null,
        isAd: false,
        quoted
    };
}