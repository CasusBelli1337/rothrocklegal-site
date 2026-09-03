import { A11Y_STORAGE_KEY, a11yOptions } from '@/config/a11y';

/**
 * The inline <head> script for the reading options: reads `rl-a11y` and stamps
 * html[data-text-size|data-contrast|data-motion|data-spacing] before first
 * paint, so a larger-text or high-contrast reader never sees the page flash.
 * Each key accepts only its own non-default values from config; anything odd
 * leaves the plain site. No external calls; must stay under 400 bytes.
 * Sits beside the lens boot script (src/lib/lens/boot.ts).
 */
export function a11yBootScript(): string {
  const allowed = a11yOptions
    .map((o) => `${o.key}:'${o.values.slice(1).map((v) => v.value).join('|')}'`)
    .join(',');
  return (
    `try{var p=JSON.parse(localStorage.getItem('${A11Y_STORAGE_KEY}')),d=document.documentElement.dataset,` +
    `v={${allowed}},k;for(k in v)if(p&&RegExp('^('+v[k]+')$').test(p[k]))d[k]=p[k]}catch(e){}`
  );
}
