import type { AllMedia, SocialMediaDetails } from "./social_media_interfaces";


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

function extractDisplayNameAndUsername(element: HTMLElement): { displayName: string | null, username: string | null } {
    // Display Name: <p class="font-semibold ...">
    const displayNameElem = element.querySelector('p.font-semibold');
    const displayName = displayNameElem?.textContent?.trim() || null;

    // Username: <p class="font-normal ...">@username</p>
    const usernameElem = Array.from(element.querySelectorAll('p.font-normal'))
        .find(p => p.textContent?.trim().startsWith('@'));
    const username = usernameElem?.textContent?.trim() || null;

    return { displayName, username };
}

function extractQuotedPost(element: HTMLElement): SocialMediaDetails | null {
    const quoted = element.querySelector('[data-testid="quoted-status"]');
    if (!quoted) return null;

    // Autor
    const { displayName, username } = extractDisplayNameAndUsername(quoted);

    // Content
    let contentElem = quoted.querySelector('p[data-markup="true"]');
    if (!contentElem) {
        const wrapper = quoted.querySelector('.status__content-wrapper');
        if (wrapper) contentElem = wrapper.querySelector('p');
    }
    const content = contentElem?.textContent?.trim() || null;

    // Medien
    const allMedia = extractAllMedia(element);

    return { platform: 'Truth Social', username, displayName, content, allMedia, isAd: false, quoted: null };
}

export function extractTruthsocialDetails(element: HTMLElement): SocialMediaDetails {
    // ID
    const dataId = element.getAttribute('data-id') || null;

    // Autor
    const { displayName, username } = extractDisplayNameAndUsername(element);

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
    const quoted = extractQuotedPost(element);

    return {
        platform: 'Truth Social',
        username,
        displayName,
        content,
        allMedia,
        isAd: false,
        quoted
    };
}