import type { ReactNode } from 'react';
import { slotShows } from '@/lib/lens/slots';
import { LENSES, type Lens, type LensCopy } from '@/lib/lens/types';
import { LensText } from './LensText';

export type SlotVariants = Partial<Record<Lens, ReactNode>> & { neutral: ReactNode };

interface SlotProps {
  /** Slot name; scripts/check-lens.mjs verifies every name in the export covers all three lenses. */
  name: string;
  /** A missing framing falls back to neutral; equal values (strings by value, nodes by reference) share one element. */
  variants: SlotVariants;
  as?: 'span' | 'div';
  className?: string;
  /** Class for links inside string variants. */
  linkClassName?: string;
}

/**
 * Renders every framing of one piece of copy into the HTML with `data-for`.
 * Every framing but the neutral one carries `hidden`, so crawlers, AI tools
 * reading the raw HTML, no-JS readers, and first-time visitors meet one
 * framing per slot; the head script and LensTracker move `hidden` to the
 * framing matching html[data-lens] (src/lib/lens/slots.ts). They may do so
 * before hydration, hence suppressHydrationWarning (this element only).
 */
export function Slot({ name, variants, as: Tag = 'span', className, linkClassName }: SlotProps) {
  const groups: { node: ReactNode; lenses: Lens[] }[] = [];
  for (const lens of LENSES) {
    const node = variants[lens] === undefined ? variants.neutral : variants[lens];
    const group = groups.find((g) => Object.is(g.node, node));
    if (group) group.lenses.push(lens);
    else groups.push({ node, lenses: [lens] });
  }
  return (
    <>
      {groups.map(({ node, lenses }) => (
        <Tag
          key={lenses.join(' ')}
          data-slot={name}
          data-for={lenses.join(' ')}
          hidden={!slotShows(lenses.join(' '), 'neutral')}
          suppressHydrationWarning
          className={className}
        >
          {typeof node === 'string' ? <LensText text={node} linkClassName={linkClassName} /> : node}
        </Tag>
      ))}
    </>
  );
}

/**
 * Builds Slot variants from a typed copy map, rendering each distinct value
 * once so lenses that share a value (by reference) share one element.
 */
export function renderVariants<T>(
  copy: LensCopy<T>,
  render: (value: T) => ReactNode,
): SlotVariants {
  const rendered = new Map<T, ReactNode>();
  const node = (value: T): ReactNode => {
    if (!rendered.has(value)) rendered.set(value, render(value));
    return rendered.get(value);
  };
  return {
    neutral: node(copy.neutral),
    trustee: node(copy.trustee),
    beneficiary: node(copy.beneficiary),
  };
}
