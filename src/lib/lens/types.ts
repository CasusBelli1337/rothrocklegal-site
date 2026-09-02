/**
 * The lens (docs/LENS.md): the visitor's probable side of the table, inferred
 * in the browser from where they landed and what they clicked. Nothing here
 * leaves the browser; the neutral site is what crawlers and no-JS readers see.
 */

export const LENSES = ['neutral', 'trustee', 'beneficiary'] as const;
export type Lens = (typeof LENSES)[number];

/**
 * Attribute a server component puts on a link so a click records that event
 * (LensTracker relays it). Lives here, not in a client module, so server
 * components get the string and not a client reference.
 */
export const LENS_EVENT_ATTR = 'data-lens-event';

export interface LensSignal {
  key: string;
  weight: number;
  /** ISO timestamp. */
  at: string;
}

export interface LensState {
  score: number;
  signals: LensSignal[];
  updatedAt: string;
}

/** What a path or click does to the score: nudge it by `weight`, or `set` it outright (the escape hatch). */
export type LensEffect = { key: string; weight: number } | { key: string; set: number };

/** One copy slot: the neutral text plus the two framings. */
export type LensCopy<T = string> = Record<Lens, T>;
