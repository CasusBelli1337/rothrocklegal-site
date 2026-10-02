import { consentConfig, offeredCategories } from '@/config/consent';
import { MAX_AGE_MS } from './store';

/** The inline script must stay under this many bytes (scripts/check-consent.mjs asserts it). */
export const CONSENT_BOOT_MAX_BYTES = 450;

/**
 * The inline <head> script for privacy choices: reads `rl-consent` and stamps
 * html[data-consent] before first paint, with the same rules as
 * consentAttribute() in store.ts: 'ask' (the bar shows), the granted categories,
 * or 'none'. A missing, old, other-version, or unreadable record is 'ask'; so is
 * one made before a Global Privacy Control or Do Not Track signal appeared. A
 * sale-or-share category never counts while a signal is on. No external calls.
 * Without JavaScript nothing is stamped, the bar stays hidden, and no tracker can run.
 */
export function consentBootScript(): string {
  const offered = offeredCategories();
  if (offered.length === 0) return `document.documentElement.dataset.consent='none'`;
  const keys = JSON.stringify(offered.map((c) => c.key));
  const sale = offered.filter((c) => c.saleOrShare).map((c) => c.key);
  const saleClause = sale.length > 0 ? `&&!(s&&${JSON.stringify(sale)}.indexOf(c)>=0)` : '';
  return (
    `var d='ask';try{var r=JSON.parse(localStorage.getItem('${consentConfig.storageKey}')),n=navigator,` +
    `s=n.globalPrivacyControl===true||n.doNotTrack==='1',t=r.savedAt,a=Date.now()-t,g=r.granted;` +
    `if(r.version===${consentConfig.version}&&t===+t&&a>=0&&a<${MAX_AGE_MS}&&Array.isArray(g)&&(r.signal===true||!s))` +
    `d=${keys}.filter(function(c){return g.indexOf(c)>=0${saleClause}}).join(' ')||'none'}` +
    `catch(e){}document.documentElement.dataset.consent=d`
  );
}
