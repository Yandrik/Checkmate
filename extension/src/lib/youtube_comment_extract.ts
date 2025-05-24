export interface YoutubeCommentDetails {
    author: string | null;
    channelUrl: string | null;
    content: string | null;
}

export function extractYoutubeCommentDetailsFromElement(element: HTMLElement): YoutubeCommentDetails {
    // Autor
    const authorElem = element.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
    const author = authorElem?.textContent?.trim() || null;

    // Kommentartext
    const contentElem = element.querySelector('#content-text');
    const content = contentElem?.textContent?.trim() || null;

    // Channel-URL
    const channelLink = element.querySelector('#author-text, a.yt-simple-endpoint.style-scope.yt-formatted-string');
    const channelUrl = channelLink instanceof HTMLAnchorElement ? channelLink.href : null;

    return {
        author,
        channelUrl,
        content,
    };
}