import { SIGNATURE_IMAGE_MAX_BYTES, dataUrlByteLength, inkBounds, type Point } from './signature-image';

/**
 * Browser-only canvas plumbing for the drawing pad. The pixel math lives in
 * signature-image.ts so it can be tested without a canvas.
 */
export const PEN_WIDTH = 2.5;
const INK = '#1b1816';
const CROP_MARGIN = 12;

/** Sizes the backing store to the CSS box at device resolution and sets the pen. */
export function preparePad(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.lineWidth = PEN_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  return ctx;
}

export function strokeSegment(ctx: CanvasRenderingContext2D, from: Point, to: Point): void {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

/** A tap without movement still leaves a dot, so a short signature is never "blank". */
export function strokeDot(ctx: CanvasRenderingContext2D, at: Point): void {
  ctx.beginPath();
  ctx.arc(at.x, at.y, PEN_WIDTH / 2, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();
}

export function clearPad(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function encode(source: CanvasImageSource, width: number, height: number): string {
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(width));
  out.height = Math.max(1, Math.round(height));
  const ctx = out.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(source, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

/**
 * The drawing cropped to its ink on a transparent background, as a PNG data URL
 * under the server's limit (shrunk in steps if a very busy drawing runs over);
 * null when nothing was drawn.
 */
export function padToPng(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = inkBounds(pixels.data, canvas.width, canvas.height, CROP_MARGIN);
  if (!bounds) return null;
  const crop = document.createElement('canvas');
  crop.width = bounds.width;
  crop.height = bounds.height;
  const cropCtx = crop.getContext('2d');
  if (!cropCtx) return null;
  cropCtx.putImageData(
    ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    0,
    0,
  );
  let scale = 1;
  let url = crop.toDataURL('image/png');
  while (dataUrlByteLength(url) > SIGNATURE_IMAGE_MAX_BYTES && scale > 0.2) {
    scale *= 0.7;
    url = encode(crop, bounds.width * scale, bounds.height * scale);
  }
  return url;
}
