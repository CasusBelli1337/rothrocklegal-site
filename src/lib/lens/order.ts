import type { CSSProperties } from 'react';
import { LENSES, type Lens } from './types';

/**
 * Per-lens ordering without re-rendering: every item gets the `lens-ordered`
 * class and `--lens-order-<lens>` custom properties; globals.css turns them
 * into CSS `order` under html[data-lens]. Neutral keeps DOM order.
 */

export const LENS_ORDERED_CLASS = 'lens-ordered';

export function lensOrderStyle(
  key: string,
  keys: readonly string[],
  firstByLens: Partial<Record<Lens, readonly string[]>>,
): CSSProperties {
  const style: Record<string, number> = {};
  for (const lens of LENSES) {
    const first = firstByLens[lens];
    if (lens === 'neutral' || !first) continue;
    const ordered = [
      ...first.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !first.includes(k)),
    ];
    style[`--lens-order-${lens}`] = ordered.indexOf(key);
  }
  return style as CSSProperties;
}
