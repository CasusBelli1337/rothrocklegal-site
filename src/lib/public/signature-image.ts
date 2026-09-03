import { SIGN_COPY } from './copy';

/**
 * Pure checks and pixel math for the drawn signature. The server accepts a PNG
 * data URL of at most 200 KB (portal SignatureImageSchema); the page checks the
 * same limit before sending so the person hears about it in plain words.
 */
export const SIGNATURE_IMAGE_MAX_BYTES = 200 * 1024;
const PNG_PREFIX = 'data:image/png;base64,';

export function isPngDataUrl(value: string): boolean {
  return value.startsWith(PNG_PREFIX) && /^[A-Za-z0-9+/]+=*$/.test(value.slice(PNG_PREFIX.length));
}

/** Decoded size of the image behind a data URL (base64 grows bytes by 4/3). */
export function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : '';
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}

/** Null when the image can be sent; otherwise the sentence to show. */
export function signatureImageProblem(dataUrl: string): string | null {
  if (!isPngDataUrl(dataUrl)) return SIGN_COPY.problems.drawn;
  if (dataUrlByteLength(dataUrl) > SIGNATURE_IMAGE_MAX_BYTES) return SIGN_COPY.problems.imageTooLarge;
  return null;
}

export interface InkBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The box around every pixel with any opacity, in RGBA data of `width` x `height`;
 * null for a blank canvas. `margin` pixels of air are kept around the ink.
 */
export function inkBounds(
  data: ArrayLike<number>,
  width: number,
  height: number,
  margin = 0,
): InkBounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  const x = Math.max(0, minX - margin);
  const y = Math.max(0, minY - margin);
  return {
    x,
    y,
    width: Math.min(width, maxX + margin + 1) - x,
    height: Math.min(height, maxY + margin + 1) - y,
  };
}

export interface Point {
  x: number;
  y: number;
}

/** A pointer position relative to the pad, in CSS pixels. */
export function padPoint(rect: { left: number; top: number }, clientX: number, clientY: number): Point {
  return { x: clientX - rect.left, y: clientY - rect.top };
}
