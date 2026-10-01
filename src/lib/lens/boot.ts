import { lensConfig } from '@/config/lens';
import { LENS_SLOT_SELECTOR } from './slots';

/**
 * The inline <head> script. Before first paint it:
 *  1. installs a MutationObserver that, as the parser (and later React) adds
 *     nodes, sets `hidden` on every slot variant that does not serve the lens
 *     on <html> and clears it on the one that does (syncLensSlots() in
 *     slots.ts is the readable version). Observer callbacks run as microtasks,
 *     before the browser paints, so a stored framing never flashes;
 *  2. reads `rl-lens` and stamps html[data-lens] with the same thresholds as
 *     resolveLens(); anything odd leaves no attribute (the neutral site).
 * The observer goes in first: if it cannot be built, no lens is stamped and the
 * page stays on the static neutral copy. Block-scoped `let`, never `var`: the
 * reading-options script beside it declares globals (`d` among them) that
 * would otherwise overwrite what the observer reads later. No external calls;
 * under 400 bytes.
 */
export function lensBootScript(): string {
  const { storageKey, trusteeAt, beneficiaryAt } = lensConfig;
  return (
    `try{let d=document,h=d.documentElement,t=h.dataset;new MutationObserver(()=>{let l=t.lens||'neutral';` +
    `d.querySelectorAll('${LENS_SLOT_SELECTOR}').forEach(e=>{let x=e.dataset.for.split(' ').indexOf(l)<0;` +
    `if(e.hidden!=x)e.hidden=x})}).observe(h,{childList:1,subtree:1});` +
    `let c=JSON.parse(localStorage.getItem('${storageKey}'))?.score;` +
    `if(c>=${trusteeAt})t.lens='trustee';else if(c<=${beneficiaryAt})t.lens='beneficiary'}catch(e){}`
  );
}
