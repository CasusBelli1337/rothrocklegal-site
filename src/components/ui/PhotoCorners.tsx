import type { CSSProperties } from 'react';

/**
 * Brass photo-album mounts on the four corners of a tile (Arthur, 2026-09-03):
 * a filled right triangle in each corner, right angle out, hypotenuse toward
 * the centre, with a hairline of brass-600 along the hypotenuse for depth.
 * Render it as the first child of a `relative` box with a 1px border; each
 * mount starts one pixel outside the padding edge so the border corner is
 * covered. Shapes are clip-paths (crisp at any size); colors are theme tokens.
 */

interface Corner {
  place: string;
  clip: string;
  /** Gradient direction, from the right angle toward the hypotenuse. */
  angle: string;
}

const CORNERS: readonly Corner[] = [
  { place: '-top-px -left-px', clip: 'polygon(0 0, 100% 0, 0 100%)', angle: '135deg' },
  { place: '-top-px -right-px', clip: 'polygon(0 0, 100% 0, 100% 100%)', angle: '225deg' },
  { place: '-bottom-px -left-px', clip: 'polygon(0 0, 0 100%, 100% 100%)', angle: '45deg' },
  { place: '-bottom-px -right-px', clip: 'polygon(100% 0, 100% 100%, 0 100%)', angle: '315deg' },
];

/** In a square, the 50% stop of a diagonal gradient is the hypotenuse; the band just before it is the lip. */
function mountStyle({ clip, angle }: Corner): CSSProperties {
  return {
    clipPath: clip,
    backgroundImage:
      `linear-gradient(${angle}, var(--color-brass-400) calc(50% - 1.5px), ` +
      'var(--color-brass-600) calc(50% - 1.5px))',
  };
}

interface PhotoCornersProps {
  /** Leg length; the default is 1.75rem on phones and 2.75rem from lg. */
  sizeClassName?: string;
}

export function PhotoCorners({ sizeClassName = 'h-7 w-7 lg:h-11 lg:w-11' }: PhotoCornersProps) {
  return (
    <>
      {CORNERS.map((corner) => (
        <span
          key={corner.place}
          aria-hidden="true"
          className={`pointer-events-none absolute ${corner.place} ${sizeClassName}`}
          style={mountStyle(corner)}
        />
      ))}
    </>
  );
}
