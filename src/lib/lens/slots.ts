import type { Lens } from './types';

/**
 * Which framing of a lens slot is visible (docs/LENS.md §1). Every variant
 * carries `data-for` (the lenses it serves, space-separated); the static export
 * marks every variant that does not serve `neutral` with the HTML `hidden`
 * attribute, so a reader of the raw HTML (an AI tool, a text extractor, a
 * no-JS browser) meets one framing per slot. In the browser the head script's
 * MutationObserver (boot.ts) and LensTracker keep `hidden` matched to
 * html[data-lens]; this module is the readable reference both follow.
 */

export const LENS_SLOT_SELECTOR = '[data-for]';

/** True when a variant tagged `data-for="neutral beneficiary"` is the one shown under `lens`. */
export function slotShows(dataFor: string, lens: Lens): boolean {
  return dataFor.split(' ').includes(lens);
}

/** Sets or clears `hidden` on every slot variant under `root` so exactly the `lens` framing shows. */
export function syncLensSlots(root: ParentNode, lens: Lens): void {
  root.querySelectorAll<HTMLElement>(LENS_SLOT_SELECTOR).forEach((variant) => {
    const hide = !slotShows(variant.dataset.for ?? '', lens);
    if (variant.hidden !== hide) variant.hidden = hide;
  });
}
