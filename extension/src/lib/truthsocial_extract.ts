import type { AllMedia } from "./twitter_extract";

export interface QuotedTruthsocialPost {
    author: string | null;
    authorUrl: string | null;
    content: string | null;
    allMedia?: AllMedia | null;
}

export interface TruthsocialPostDetails {
    type: 'post' | 'comment';
    author: string | null;
    authorUrl: string | null;
    content: string | null;
    url: string | null;
    allMedia?: AllMedia | null;
    quotedPost?: QuotedTruthsocialPost | null;
}

function extractAllMedia(element: HTMLElement): AllMedia {
    const images = Array.from(element.querySelectorAll('img')).filter(img => {
        // Filtere Avatare, Emojis, UI-Icons etc. raus
        const src = img.src;
        if (
            !src ||
            src.startsWith('data:') ||
            src.includes('emoji') ||
            src.includes('avatar') ||
            src.includes('icon') ||
            src.includes('badge') ||
            src.includes('logo') ||
            img.width < 40
        ) {
            return false;
        }
        return true;
    }).map((img, idx) => ({
        type: 'image',
        url: img.src,
        alt: img.alt || '',
        position: idx + 1,
    }));

    const videos = Array.from(element.querySelectorAll('video')).map(video => ({
        type: 'video',
        poster: video.poster || null,
        duration: video.duration ? video.duration.toString() : null,
        hasVideo: true,
        note: 'Truth Social video',
    }));

    return {
        images,
        videos,
        hasMedia: images.length > 0 || videos.length > 0,
    };
}

function extractQuotedPost(element: HTMLElement): QuotedTruthsocialPost | null {
    const quoted = element.querySelector('[data-testid="quoted-status"]');
    if (!quoted) return null;

    // Autor
    let author: string | null = null;
    let authorUrl: string | null = null;
    const authorLink = quoted.querySelector('a[href^="/@"]');
    if (authorLink instanceof HTMLAnchorElement) {
        authorUrl = authorLink.href;
        const usernameSpan = authorLink.querySelector('span[data-testid="account-username"]');
        if (usernameSpan) {
            author = usernameSpan.textContent?.trim() || null;
        }
    }
    if (!author) {
        const handleP = Array.from(quoted.querySelectorAll('p'))
            .find(p => p.textContent?.trim().startsWith('@'));
        if (handleP) {
            author = handleP.textContent?.trim() || null;
        }
    }
    if (!author && authorLink) {
        author = authorLink.textContent?.trim() || null;
    }

    // Content
    let contentElem = quoted.querySelector('p[data-markup="true"]');
    if (!contentElem) {
        const wrapper = quoted.querySelector('.status__content-wrapper');
        if (wrapper) contentElem = wrapper.querySelector('p');
    }
    const content = contentElem?.textContent?.trim() || null;

    // Medien
    const allMedia = extractAllMedia(quoted);

    return { author, authorUrl, content, allMedia };
}

export function extractTruthsocialDetails(element: HTMLElement): TruthsocialPostDetails {
    // ID
    const dataId = element.getAttribute('data-id') || null;

    // Autor
    let author: string | null = null;
    let authorUrl: string | null = null;
    const authorLink = element.querySelector('a[href^="/@"]');
    if (authorLink instanceof HTMLAnchorElement) {
        authorUrl = authorLink.href;
        // 1. Versuche, das Username-Span zu finden
        const usernameSpan = authorLink.querySelector('span[data-testid="account-username"]');
        if (usernameSpan) {
            author = usernameSpan.textContent?.trim() || null;
        }
    }
    // 2. Suche nach <p>, das mit @ beginnt (Handle)
    if (!author) {
        const handleP = Array.from(element.querySelectorAll('p'))
            .find(p => p.textContent?.trim().startsWith('@'));
        if (handleP) {
            author = handleP.textContent?.trim() || null;
        }
    }
    // 3. Wenn author noch leer, suche nach <p class="font-semibold ...">
    if (!author) {
        const nameP = element.querySelector('p.font-semibold');
        if (nameP) {
            author = nameP.textContent?.trim() || null;
        }
    }
    // 4. Fallback: Linktext, falls dort doch mal der Name steht
    if (!author && authorLink) {
        author = authorLink.textContent?.trim() || null;
    }
    // 5. "Posted by" entfernen, falls vorhanden
    if (author) {
        author = author.replace(/^Posted by\s*/i, '').trim();
    }

    // URL
    let contentElem = element.querySelector('p[data-markup="true"]');
    if (!contentElem) {
        const wrapper = element.querySelector('.status__content-wrapper');
        if (wrapper) contentElem = wrapper.querySelector('p');
    }
    const content = contentElem?.textContent?.trim() || null;

    let url: string | null = null;
    const urlElem = element.querySelector('a[href*="/posts/"]');
    if (urlElem instanceof HTMLAnchorElement) {
        url = urlElem.href;
    } else {
        url = window.location.href;
    }

    // Media
    const allMedia = extractAllMedia(element);

    //Quoted Post
    const quotedPost = extractQuotedPost(element);

    // Ein Kommentar ist ein status__wrapper[data-id] mit status-reply
    const isComment =
        element.classList.contains('status__wrapper') &&
        element.classList.contains('status-reply') &&
        element.hasAttribute('data-id');

    // Ein Post ist ein status__wrapper[data-id] OHNE status-reply oder ein .detailed-actualStatus
    const isPost =
        (element.classList.contains('status__wrapper') &&
            element.hasAttribute('data-id') &&
            !element.classList.contains('status-reply')) ||
        element.classList.contains('detailed-actualStatus');

    if (isPost) {
        return {
            type: 'post',
            author,
            authorUrl,
            content,
            url,
            allMedia,
            quotedPost,
        };
    } else if (isComment) {
        return {
            type: 'comment',
            author,
            authorUrl,
            content,
            url,
            allMedia,
            quotedPost,
        };
    } else {
        return {
            type: 'post',
            author,
            authorUrl,
            content,
            url,
            allMedia,
            quotedPost,
        };
    }
}