import type { MediaDetailsRequest } from "@/lib/api/models/MediaDetailsRequest";

function getCurrentVideoTime(): number | null {
    const video = document.querySelector('video');
    return video ? video.currentTime : null;
}

function getPlayerResponseFromDom(): any | null {
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const script of scripts) {
        const text = script.textContent;
        if (!text) continue;
        const match = text.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/s);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                // ignore parse errors
            }
        }
    }
    return null;
}
async function fetchCaptionUrl(): Promise<string | null> {
    const playerResponse = getPlayerResponseFromDom();
    if (!playerResponse || !playerResponse.captions) return null;
    const tracks = playerResponse.captions.playerCaptionsTracklistRenderer?.captionTracks;
    if (tracks && tracks.length > 0) {
        return tracks[0].baseUrl || null;
    }
    return null;
}
export function parseTranscriptXml(xmlString: string): { start: number, dur: number, text: string }[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const result: { start: number, dur: number, text: string }[] = [];
    xml.querySelectorAll('text').forEach(node => {
        const start = parseFloat(node.getAttribute('start') || "0");
        const dur = parseFloat(node.getAttribute('dur') || "0");
        // YouTube kodiert Sonderzeichen als HTML-Entities
        const text = node.textContent
            ?.replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<br\s*\/?>/gi, '\n') || "";
        result.push({ start, dur, text });
    });
    return result;
}
export function getTranscriptSnippet(
    transcript: { start: number, dur: number, text: string }[],
    timecode: number,
    prev_seconds: number,
    post_seconds: number
): string {
    const from = Math.max(0, timecode - prev_seconds);
    const to = timecode + post_seconds;
    return transcript
        .filter(t => (t.start + t.dur) >= from && t.start <= to)
        .map(t => t.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function extractYoutubeVideoDetailsFromDocument(doc: Document = document): Promise<MediaDetailsRequest> {
    // Titel
    let title: string | null = null;
    const titleElem = doc.querySelector('h1.ytd-watch-metadata');
    if (titleElem) {
        title = titleElem.textContent?.trim() || null;
    }
    if (!title) {
        const metaTitle = doc.querySelector('meta[name="title"]') as HTMLMetaElement;
        if (metaTitle) title = metaTitle.content || null;
    }
    if (!title) {
        title = doc.title.replace(/ - YouTube$/, '').trim();
    }

    // Channel-Name und URL
    const channelLink = doc.querySelector('ytd-channel-name a');
    const channel = channelLink?.textContent?.trim() || "";
    const channelUrl = channelLink instanceof HTMLAnchorElement ? channelLink.href : "";

    let transcription_close_to_timestamp: string | null = null;
    let transcription_with_more_context: string | null = null;

    const currentTime = getCurrentVideoTime();
    const baseUrl = await fetchCaptionUrl();
    if (baseUrl && currentTime !== null) {
        const xmlString = await fetch(baseUrl).then(r => r.text());
        const transcript = parseTranscriptXml(xmlString);
        const snippet = getTranscriptSnippet(transcript, currentTime, 15, 5);
        const snippet2 = getTranscriptSnippet(transcript, currentTime, 500, 120);
        if (snippet) {
            transcription_close_to_timestamp = snippet;
        }
        if (snippet2) {
            transcription_with_more_context = snippet2;
        }
    }

    return {
        title,
        channel,
        channelUrl,
        transcription_close_to_timestamp,
        transcription_with_more_context,
    };
}