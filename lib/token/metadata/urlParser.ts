export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'unknown';

export function getMediaType(url: string | null | undefined): MediaType {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/.test(lower)) return 'image';
  if (/\.(mp4|webm|ogg|mov)(\?|$)/.test(lower)) return 'video';
  if (/\.(mp3|wav|flac|aac)(\?|$)/.test(lower)) return 'audio';
  if (lower.startsWith('data:image/')) return 'image';
  if (lower.startsWith('data:video/')) return 'video';
  return 'unknown';
}

export function isMediaUrl(url: string | null | undefined): boolean {
  return getMediaType(url) !== 'unknown';
}

const urlParser = { getMediaType, isMediaUrl };
export default urlParser;
