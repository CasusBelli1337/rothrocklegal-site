import { site } from '@/config/site';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

/** The tracker's file on the counter host (Umami's TRACKER_SCRIPT_NAME in the Armory). */
export const COUNTER_SCRIPT_PATH = '/c.js';

export interface CounterConfig {
  /** The counter host, e.g. https://count.rothrocklegal.com; blank switches the counter off. */
  origin: string;
  /** Umami's website id for www.rothrocklegal.com. */
  websiteId: string;
}

/** True while site.counter is filled in: the policy then describes the counter. */
export function counterConfigured(config: CounterConfig = site.counter): boolean {
  return Boolean(config.origin && config.websiteId);
}

/** True when the tag renders: configured, and not the editor preview (Arthur's edits never count). */
export function counterEnabled(config: CounterConfig = site.counter): boolean {
  return counterConfigured(config) && process.env.NEXT_PUBLIC_PREVIEW_TOOLS !== '1';
}

/** Never on the emailed-link pages; `pathname` comes from usePathname, with or without the trailing slash. */
export function counterAllowedOn(pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return !PUBLIC_LINK_PATHS.some((p) => path.startsWith(p));
}

/**
 * The tracker tag's attributes. Umami skips Do Not Track itself; it sends only from
 * the canonical host (so a local build never counts), and it drops the query string
 * and the hash, so a one-use `?t=` or `?resume=` token never leaves the browser.
 */
export function counterAttributes(
  config: CounterConfig,
  canonicalHost: string = site.canonicalHost,
): Record<string, string> {
  return {
    src: `${config.origin}${COUNTER_SCRIPT_PATH}`,
    defer: '',
    'data-website-id': config.websiteId,
    'data-domains': new URL(canonicalHost).hostname,
    'data-do-not-track': 'true',
    'data-auto-track': 'true',
    'data-exclude-search': 'true',
    'data-exclude-hash': 'true',
  };
}

/**
 * The inline loader components/seo/Counter puts in the static HTML. Under Global
 * Privacy Control or Do Not Track (the same test as privacySignal() in
 * lib/consent/store) it does nothing, so not even the script is fetched. Otherwise
 * it waits for the page's load event, then appends the tracker to <head>.
 */
export function counterLoaderScript(config: CounterConfig = site.counter): string {
  const attributes = JSON.stringify(counterAttributes(config)).replace(/</g, '\\u003c');
  return (
    `(function(){var n=navigator;if(n.globalPrivacyControl===true||n.doNotTrack==='1')return;` +
    `function go(){var s=document.createElement('script'),a=${attributes},k;` +
    `for(k in a)s.setAttribute(k,a[k]);document.head.appendChild(s)}` +
    `if(document.readyState==='complete')go();else addEventListener('load',go)})()`
  );
}
