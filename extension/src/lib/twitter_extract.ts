import type { SocialMediaDetailsRequest } from "@/lib/api/models/SocialMediaDetailsRequest";
import type { AllMediaRequest } from "@/lib/api/models/AllMediaRequest";
import type { ImageMediaRequest } from "@/lib/api/models/ImageMediaRequest";
import type { VideoMediaRequest } from "@/lib/api/models/VideoMediaRequest";

// Helper to ensure all queries are within a specific article context if provided
function queryInArticle(element: HTMLElement, selector: string): Element | null {
  return element.querySelector(`article[role="article"] ${selector.trim()}`) || element.querySelector(selector.trim());
}

function queryAllInArticle(element: HTMLElement, selector: string): NodeListOf<Element> {
  const article = element.querySelector('article[role="article"]');
  if (article) {
    return article.querySelectorAll(selector.trim());
  }
  return element.querySelectorAll(selector.trim());
}

function extractAllImages(tweetElement: HTMLElement): ImageMediaRequest[] {
  const images: ImageMediaRequest[] = [];

  // Standard tweet images
  const imageElements = queryAllInArticle(tweetElement, '[data-testid="tweetPhoto"] img');
  imageElements.forEach((imgElement, index) => {
    const htmlImgElement = imgElement as HTMLImageElement;
    if (htmlImgElement && htmlImgElement.src) {
      images.push({
        type: 'image',
        url: htmlImgElement.src,
        alt: htmlImgElement.alt || '',
        position: index + 1,
      });
    }
  });

  // Images in cards
  const cardImageElements = queryAllInArticle(tweetElement, 'div[data-testid="card.wrapper"] img[src^="https://pbs.twimg.com/media/"], div[data-testid="card.layoutLarge.media"] img[src^="https://pbs.twimg.com/media/"]');
  cardImageElements.forEach((imgElement) => {
    const htmlImgElement = imgElement as HTMLImageElement;
    if (htmlImgElement && htmlImgElement.src && !images.find(img => img.url === htmlImgElement.src)) {
      images.push({
        type: 'image',
        url: htmlImgElement.src,
        alt: htmlImgElement.alt || '',
        position: images.length + 1,
      });
    }
  });
  return images;
}

function extractVideo(tweetElement: HTMLElement): VideoMediaRequest | null {
  const videoPlayer = queryInArticle(tweetElement, '[data-testid="videoPlayer"]');
  if (!videoPlayer) return null;

  let poster: string | null = null;
  const posterImgDiv = videoPlayer.querySelector('div[style*="background-image:"]');
  if (posterImgDiv) {
    const bgImage = (posterImgDiv as HTMLElement).style.backgroundImage;
    const urlMatch = bgImage.match(/url\("?(.+?)"?\)/);
    if (urlMatch && urlMatch[1]) {
      poster = urlMatch[1];
    }
  }

  const videoElement = videoPlayer.querySelector('video') as HTMLVideoElement | null;
  if (videoElement && videoElement.poster && !poster) {
    poster = videoElement.poster;
  }

  const hasVideo = !!videoElement;
  const durationElement = videoPlayer.querySelector('[data-testid="mediaDuration"]');
  const duration = durationElement ? durationElement.textContent : null;

  return {
    type: 'video',
    poster: poster,
    duration: duration,
    hasVideo: hasVideo,
    note: 'Video data extraction.',
  };
}

function extractAllMedia(tweetElement: HTMLElement): AllMediaRequest {
  const images = extractAllImages(tweetElement);
  const video = extractVideo(tweetElement);
  const videos = video ? [video] : [];

  return {
    images: images,
    videos: videos,
    hasMedia: images.length > 0 || videos.length > 0,
  };
}

export async function extractTweetDetailsFromElement(div: HTMLElement): Promise<SocialMediaDetailsRequest> {
  // div is expected to be the div[data-testid="cellInnerDiv"]
  const articleElement = div.querySelector('article[role="article"]');

  let isAd = !!div.querySelector('div[data-testid="placementTracking"]');
  if (!isAd && articleElement) {
    // Check for "Ad" text within the specific ad label area
    const adLabelElements = articleElement.querySelectorAll('div[dir="auto"] span, div[dir="ltr"] span, span[data-testid="promotedIndicator"]');
    for (const el of Array.from(adLabelElements)) {
      // A common pattern is the "Ad" label is a short text in a span near the top
      // We check if it's a direct child of a div that's a sibling to user content/avatar area
      // This is heuristic and might need refinement.
      const parentDiv = el.parentElement;
      if (parentDiv && parentDiv.children.length === 1 && (el.textContent?.trim().toLowerCase() === 'ad' || el.textContent?.trim().toLowerCase() === 'promoted')) {
        // More specific check: ensure it's not part of tweet content
        if (!el.closest('[data-testid="tweetText"]')) {
          isAd = true;
          break;
        }
      }
    }
  }

  let username: string | null | undefined = undefined;
  let displayName: string | null | undefined = undefined;
  let tweetContent: string | null | undefined = undefined;
  let allMediaResult: AllMediaRequest | null = null;
  let quotedTweetDetails: SocialMediaDetailsRequest | null | undefined = null;

  if (articleElement) {
    // Username: Look for the link within the User-Name group that is a direct link to the user profile
    const userLink = articleElement.querySelector('div[data-testid="User-Name"] a[href^="/"][role="link"]:not([aria-label*="Timeline"])');
    if (userLink) {
      const href = userLink.getAttribute('href');
      if (href && !href.includes("/status/")) { // Ensure it's not a link to a tweet
        username = href.substring(1);
      }
    }

    // Display Name: Usually a span within the User-Name group
    const displayNameGroup = articleElement.querySelector('div[data-testid="User-Name"]');
    if (displayNameGroup) {
      const dnElement = displayNameGroup.querySelector('span > span:not([dir="ltr"])'); // Try to exclude the @username part if nested
      displayName = dnElement?.textContent || displayNameGroup.querySelector('span')?.textContent;
    }

    // Check for and click "Show more" button
    const showMoreButton = articleElement.querySelector('button[data-testid="tweet-text-show-more-link"]') as HTMLElement | null;
    if (showMoreButton) {
      showMoreButton.click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const tweetTextElement = articleElement.querySelector('[data-testid="tweetText"]');
    tweetContent = tweetTextElement?.textContent;

    if (articleElement instanceof HTMLElement) {
      allMediaResult = extractAllMedia(articleElement);
    } else {
      console.warn("extractTweetDetailsFromElement: articleElement is not an HTMLElement:", articleElement);
    }

    // Quoted Tweet: Look for an article nested within a link structure, inside the main article's content area
    // This selector targets a common structure for quoted tweets.
    const quotedTweetArticleElement = articleElement.querySelector('div[role="link"][href*="/status/"] article[role="article"]');
    if (quotedTweetArticleElement && quotedTweetArticleElement instanceof HTMLElement) {
      // Ensure we are not processing the same main article again if selectors are too broad.
      // The `quotedTweetArticleElement` should be a distinct article.
      if (quotedTweetArticleElement !== articleElement) {
        // The `extractTweetDetailsFromElement` expects a `cellInnerDiv`-like element.
        // We need to find the closest `cellInnerDiv` that contains this quoted article,
        // or if not found, we might need to adapt or pass the article directly if the function can handle it.
        // For now, we assume `extractTweetDetailsFromElement` can process an article element directly
        // if it's the root of a tweet's display.
        // A more robust approach would be to ensure `extractTweetDetailsFromElement` can handle
        // either a `cellInnerDiv` or an `article` element as its input `div`.
        // Let's try to find the parent `cellInnerDiv` of the quoted tweet.
        const parentCellOfQuoted = quotedTweetArticleElement.closest('div[data-testid="cellInnerDiv"]');
        if (parentCellOfQuoted && parentCellOfQuoted instanceof HTMLElement && parentCellOfQuoted !== div) {
          quotedTweetDetails = await extractTweetDetailsFromElement(parentCellOfQuoted);
        } else {
          // If a distinct parent cellInnerDiv is not found, or it's the same as the outer tweet's cell,
          // this indicates a different structure or a problem.
          // As a fallback, we can try to process the quoted article directly,
          // assuming `extractTweetDetailsFromElement` can handle an article.
          // This requires `extractTweetDetailsFromElement` to be robust enough.
          // console.warn("Quoted tweet article found, but its parent cellInnerDiv is not distinct or not found. Processing article directly.", quotedTweetArticleElement);
          quotedTweetDetails = await extractTweetDetailsFromElement(quotedTweetArticleElement); // Pass the article itself
        }
      }
    }
  } else {
    console.warn("extractTweetDetailsFromElement called on a div without a main article element:", div);
  }

  return {
    platform: 'X/Twitter',
    username,
    displayName,
    content: tweetContent,
    allMedia: allMediaResult,
    isAd,
    quoted: quotedTweetDetails
  };
}
