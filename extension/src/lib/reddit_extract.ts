// --- Interfaces ---
import type { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";
import type { ImageMediaRequest } from "@/lib/api/models/ImageMediaRequest";
import type {  VideoMediaRequest } from "@/lib/api/models/VideoMediaRequest";
// --- Extraction Logic ---

export function extractRedditDetailsFromElement(element: HTMLElement): SocialMediaDetailsRequest {
    // Autor extrahieren
    const username = element.getAttribute('author') || null;

    // Post oder Kommentar?
    const isPost = element.tagName.toLowerCase() === 'shreddit-post';

    // Text extrahieren
    let title: string | null = null;
    let content: string | null = null;
    let quoted: SocialMediaDetailsRequest | null = null;
    if (isPost) {
        // Titel extrahieren
        title = element.getAttribute('post-title') || '';
        // Haupttext suchen: [slot="post"], .md, .scalable-text
        let body = '';
        // 1. Versuch: [slot="post"]
        const slotPost = element.querySelector('[slot="post"]');
        if (slotPost) {
            body = Array.from(slotPost.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6'))
                .map(el => el.textContent?.trim() || '')
                .filter(Boolean)
                .join('\n');
            if (!body) body = slotPost.textContent?.trim() || '';
        }

        // 2. Versuch: [slot="text-body"] (neue Reddit-UI)
        if (!body) {
            const slotTextBody = element.querySelector('[slot="text-body"]');
            if (slotTextBody) {
                body = Array.from(slotTextBody.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6'))
                    .map(el => el.textContent?.trim() || '')
                    .filter(Boolean)
                    .join('\n');
                if (!body) body = slotTextBody.textContent?.trim() || '';
            }
        }

        // 3. Versuch: .md, .scalable-text (Fallback)
        if (!body) {
            const md = element.querySelector('.md, .scalable-text');
            if (md) {
                body = Array.from(md.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6'))
                    .map(el => el.textContent?.trim() || '')
                    .filter(Boolean)
                    .join('\n');
                if (!body) body = md.textContent?.trim() || '';
            }
        }

        // Skriptreste entfernen
        if (body) {
            body = body.replace(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g, '');
            body = body.replace(/document\s*\.\s*\w+\s*\([^)]*\)\s*\.\s*\w+\s*\([^)]*\)\s*;/g, '');
            body = body.replace(/\n{2,}/g, '\n').trim();
        }
        content = body || null;
    } else {
        // Kommentartext wie gehabt
        const commentContent = element.querySelector('[slot="comment"]');
        if (commentContent) {
            content = commentContent.textContent?.trim() || null;
        }

        // Parent-Kommentar extrahieren (quoted)
        const parentId = element.getAttribute('parentid');
        if (parentId && parentId.startsWith('t1_')) {
            // Suche nach dem Parent-Kommentar im DOM
            const parentComment = document.querySelector(`shreddit-comment[thingid="${parentId}"]`) as HTMLElement | null;
            if (parentComment) {
                // Autor extrahieren
                const parentUsername = parentComment.getAttribute('author') || null;
                // Inhalt extrahieren
                const parentCommentContent = parentComment.querySelector('[slot="comment"]');
                const parentContent = parentCommentContent?.textContent?.trim() || null;
                // Bilder/Videos extrahieren (optional)
                const parentImages: ImageMediaRequest[] = [];
                parentComment.querySelectorAll('img').forEach((img) => {
                    const src = img.src;
                    if (
                        !src ||
                        src.startsWith('data:') ||
                        src.includes('emoji') ||
                        src.includes('avatar') ||
                        src.includes('awards') ||
                        src.includes('award') ||
                        src.includes('icon') ||
                        src.includes('faceplate') ||
                        src.includes('sprites') ||
                        src.includes('profileBadge') ||
                        src.includes('bannerBackgroundImage') ||
                        src.includes('communityIcon') ||
                        img.closest('[slot="commentAvatar"]') ||
                        img.closest('[slot="commentMeta"]') ||
                        img.closest('button') ||
                        img.width < 40
                    ) {
                        return;
                    }
                    parentImages.push({
                        type: 'image',
                        url: src,
                        alt: img.alt || '',
                        position: parentImages.length + 1,
                    });
                });
                const parentVideos: VideoMediaRequest[] = [];
                parentComment.querySelectorAll('video').forEach((video) => {
                    parentVideos.push({
                        type: 'video',
                        poster: video.poster || null,
                        duration: video.duration ? video.duration.toString() : null,
                        hasVideo: true,
                        note: 'Reddit video',
                    });
                });

                quoted = {
                    platform: 'Reddit',
                    username: parentUsername,
                    displayName: null,
                    content: parentContent,
                    allMedia: {
                        images: parentImages,
                        videos: parentVideos,
                        hasMedia: parentImages.length > 0 || parentVideos.length > 0,
                    },
                    isAd: false,
                    quoted: null,
                };
            }
        }
    }

    // Bilder extrahieren
    const images: ImageMediaRequest[] = [];
    const seen = new Set<string>();
    element.querySelectorAll('img').forEach((img) => {
        const src = img.src;

        // Filter: keine Avatare, Badges, Emojis, Awards, UI-Icons, Sprites, Share-Icons etc.
        if (
            !src ||
            src.startsWith('data:') ||
            src.includes('emoji') ||
            src.includes('avatar') ||
            src.includes('awards') ||
            src.includes('award') ||
            src.includes('icon') ||
            src.includes('faceplate') ||
            src.includes('sprites') ||
            src.includes('profileBadge') ||
            src.includes('bannerBackgroundImage') || // Subreddit-Banner
            src.includes('communityIcon') ||         // Subreddit-Icon
            img.closest('[slot="commentAvatar"]') ||
            img.closest('[slot="commentMeta"]') ||
            img.closest('button') ||
            img.width < 40
        ) {
            return;
        }
        // Doppelte Bilder filtern
        if (seen.has(src)) return;
        seen.add(src);

        images.push({
            type: 'image',
            url: src,
            alt: img.alt || '',
            position: images.length + 1,
        });
    });

    // Videos extrahieren
    const videos: VideoMediaRequest[] = [];
    element.querySelectorAll('video').forEach((video) => {
        videos.push({
            type: 'video',
            poster: video.poster || null,
            duration: video.duration ? video.duration.toString() : null,
            hasVideo: true,
            note: 'Reddit video',
        });
    });

    return {
        platform: 'Reddit',
        username,
        displayName: null,
        content: (title ? title : '') + (content ? `\n\n${content}` : ''),
        allMedia: {
            images,
            videos,
            hasMedia: images.length > 0 || videos.length > 0,
        },
        isAd: false,
        quoted: quoted,
    };
}