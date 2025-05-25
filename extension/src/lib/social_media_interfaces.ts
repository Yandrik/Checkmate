// --- Interfaces ---
export interface ImageMedia {
  type: 'image';
  url: string;
  alt: string;
  position?: number;
}

export interface VideoMedia {
  type: 'video';
  poster: string | null; // Thumbnail image
  duration: string | null;
  hasVideo: boolean;
  note: string;
}

export interface AllMedia {
  images: ImageMedia[];
  videos: VideoMedia[];
  hasMedia: boolean;
}

export interface SocialMediaDetails {
  platform: string;
  username: string | null | undefined;
  displayName: string | null | undefined;
  content: string | null | undefined;
  allMedia?: AllMedia | null;
  isAd: boolean;
  quoted?: SocialMediaDetails | null;
}

export interface VideoDetails {
    title: string | null;
    channel: string | null;
    channelUrl: string | null;
    transcription_close_to_timestamp: string | null;
    transcription_with_more_context: string | null;
}