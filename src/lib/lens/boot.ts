import { lensConfig } from '@/config/lens';

/**
 * The inline <head> script: reads `rl-lens` and stamps html[data-lens] before
 * first paint, with the same thresholds as resolveLens(), so the framing never
 * flickers and never depends on hydration. Anything odd → no attribute →
 * the neutral site. No external calls; must stay under 400 bytes.
 */
export function lensBootScript(): string {
  const { storageKey, trusteeAt, beneficiaryAt } = lensConfig;
  return (
    `try{var s=JSON.parse(localStorage.getItem('${storageKey}')),c=s&&s.score;` +
    `if(c>=${trusteeAt})document.documentElement.dataset.lens='trustee';` +
    `else if(c<=${beneficiaryAt})document.documentElement.dataset.lens='beneficiary'}catch(e){}`
  );
}
