import { describe, expect, it } from 'vitest';
import {
  SIGNATURE_IMAGE_MAX_BYTES,
  dataUrlByteLength,
  inkBounds,
  isPngDataUrl,
  padPoint,
  signatureImageProblem,
} from './signature-image';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('signature image checks', () => {
  it('recognizes a PNG data URL and nothing else', () => {
    expect(isPngDataUrl(PNG)).toBe(true);
    expect(isPngDataUrl('data:image/jpeg;base64,AAAA')).toBe(false);
    expect(isPngDataUrl('data:image/png;base64,not base64!')).toBe(false);
  });

  it('measures the decoded bytes behind a data URL', () => {
    expect(dataUrlByteLength('data:image/png;base64,AAAA')).toBe(3);
    expect(dataUrlByteLength('data:image/png;base64,AAA=')).toBe(2);
    expect(dataUrlByteLength('data:image/png;base64,AA==')).toBe(1);
    expect(dataUrlByteLength(PNG)).toBe(70);
  });

  it('accepts a small PNG and refuses a huge one or a non-PNG in plain words', () => {
    expect(signatureImageProblem(PNG)).toBeNull();
    const huge = `data:image/png;base64,${'A'.repeat(Math.ceil((SIGNATURE_IMAGE_MAX_BYTES + 3) / 3) * 4)}`;
    expect(signatureImageProblem(huge)).toMatch(/too detailed/);
    expect(signatureImageProblem('data:image/gif;base64,AAAA')).toMatch(/draw your signature/i);
  });
});

describe('ink bounds', () => {
  function image(width: number, height: number, inked: [number, number][]): Uint8ClampedArray {
    const data = new Uint8ClampedArray(width * height * 4);
    for (const [x, y] of inked) data[(y * width + x) * 4 + 3] = 255;
    return data;
  }

  it('is null for a blank canvas', () => {
    expect(inkBounds(image(4, 4, []), 4, 4)).toBeNull();
  });

  it('wraps the inked pixels, with a margin clamped to the canvas', () => {
    expect(inkBounds(image(10, 10, [[2, 3], [5, 7]]), 10, 10)).toEqual({ x: 2, y: 3, width: 4, height: 5 });
    expect(inkBounds(image(10, 10, [[2, 3], [5, 7]]), 10, 10, 3)).toEqual({ x: 0, y: 0, width: 9, height: 10 });
  });

  it('maps a pointer to pad coordinates', () => {
    expect(padPoint({ left: 10, top: 20 }, 15, 50)).toEqual({ x: 5, y: 30 });
  });
});
