/**
 * Where the page goes when the flow changes screen: the panel's top edge lands
 * just under the sticky header, and focus moves to the new heading without a
 * second scroll. Never the top of the page (Arthur, 2026-09-03: every Next and
 * Back threw him to the top and made him scroll back down).
 */

/** Air between the header's bottom edge and the panel. */
export const PANEL_GAP_PX = 16;

export interface ScrollEnv {
  /** Pixels the page is already scrolled. */
  scrollY: number;
  /** The panel's top edge, relative to the viewport. */
  panelTop: number;
  /** The sticky header's current height (it grows when the reading options are open). */
  headerHeight: number;
  reducedMotion: boolean;
}

/** The document offset that puts the panel's top edge under the header; never negative. */
export function panelScrollTarget(env: ScrollEnv, gap = PANEL_GAP_PX): number {
  return Math.max(0, Math.round(env.scrollY + env.panelTop - env.headerHeight - gap));
}

/** A hand-picked reduced-motion choice counts the same as the system setting. */
export function prefersReducedMotion(doc: Document, win: Window): boolean {
  if (doc.documentElement.dataset.motion === 'reduced') return true;
  try {
    return win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function readScrollEnv(panel: HTMLElement, doc: Document, win: Window): ScrollEnv {
  const header = doc.querySelector('header');
  return {
    scrollY: win.scrollY,
    panelTop: panel.getBoundingClientRect().top,
    headerHeight: header?.getBoundingClientRect().height ?? 0,
    reducedMotion: prefersReducedMotion(doc, win),
  };
}

/** Scrolls the panel under the header (smoothly unless motion is reduced), then focuses the heading in place. */
export function revealPanel(
  panel: HTMLElement | null,
  heading: HTMLElement | null,
  doc: Document = document,
  win: Window = window,
): void {
  if (panel) {
    const env = readScrollEnv(panel, doc, win);
    win.scrollTo({ top: panelScrollTarget(env), behavior: env.reducedMotion ? 'auto' : 'smooth' });
  }
  heading?.focus({ preventScroll: true });
}
