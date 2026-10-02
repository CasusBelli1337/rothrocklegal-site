import type { ConsentState } from '@/lib/consent/store';
import { RESUME_PARAM } from '@/lib/intake/resume';
import { TOKEN_PARAM } from '@/lib/public/api';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

/** Query parameters that carry a one-use emailed link; Google never sees them. */
export const PRIVATE_PARAMS = [TOKEN_PARAM, RESUME_PARAM] as const;

export const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=';

type ConsentValue = 'granted' | 'denied';
type ConsentModeState = Record<
  'analytics_storage' | 'ad_storage' | 'ad_user_data' | 'ad_personalization',
  ConsentValue
>;

/** Google Consent Mode v2 defaults: everything denied until the visitor says yes. */
export const CONSENT_DEFAULTS: ConsentModeState = Object.freeze({
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});

/**
 * GA4 never joins a visit to a Google account or uses it for ads, whatever the
 * property settings say (privacy policy, "Technical information").
 */
export const GA_PRIVACY_CONFIG = {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
} as const;

/** The Consent Mode update for a choice; the ad types follow the advertising category (#seam:consent-advertising). */
export function consentModeUpdate(state: ConsentState): ConsentModeState {
  const ads: ConsentValue = state.advertising ? 'granted' : 'denied';
  return {
    analytics_storage: state.analytics ? 'granted' : 'denied',
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

export type Gtag = (...args: unknown[]) => void;

export interface GaWindow {
  dataLayer?: unknown[];
  gtag?: Gtag;
  [disableFlag: `ga-disable-${string}`]: boolean | undefined;
}

/** What the loader touches, passed in so tests can run it against fakes. */
export interface TagHost {
  window: GaWindow;
  document: {
    createElement: (tag: 'script') => { src: string; async: boolean };
    head: { appendChild: (node: { src: string; async: boolean }) => unknown };
    cookie: string;
  };
  location: { pathname: string; href: string; hostname: string };
}

/** GA never runs on the emailed-link pages (/sign/, /schedule/). */
export function tagAllowedOn(pathname: string): boolean {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return !PUBLIC_LINK_PATHS.some((p) => pathname.startsWith(`${base}${p}`));
}

/** The config parameters: the privacy flags, plus the address without any one-use token. */
export function gaConfigParams(href: string): Record<string, unknown> {
  const url = new URL(href);
  PRIVATE_PARAMS.forEach((key) => url.searchParams.delete(key));
  return url.href === href
    ? { ...GA_PRIVACY_CONFIG }
    : { ...GA_PRIVACY_CONFIG, page_location: url.href };
}

function installGtag(w: GaWindow): Gtag {
  if (w.gtag) return w.gtag;
  const dataLayer = (w.dataLayer ??= []);
  // gtag.js reads Arguments objects, not arrays, so this cannot use rest parameters.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  w.gtag('consent', 'default', CONSENT_DEFAULTS);
  return w.gtag;
}

/**
 * Starts GA4 after a yes (components/seo/GaLoader). Consent Mode's default
 * (all denied) is the first command, then the visitor's update, then the tag.
 * gtag.js is injected once, here rather than by next/script, so it is never
 * preloaded ahead of the page's own CSS, fonts, and hero image. Returns false
 * when the page may not carry the tag.
 */
export function startGa(host: TagHost, measurementId: string, state: ConsentState): boolean {
  const { window: w, document: d, location: l } = host;
  if (!state.analytics || !tagAllowedOn(l.pathname)) return false;
  w[`ga-disable-${measurementId}`] = false;
  const firstRun = !w.gtag;
  const gtag = installGtag(w);
  gtag('consent', 'update', consentModeUpdate(state));
  if (!firstRun) return true;
  gtag('js', new Date());
  gtag('config', measurementId, gaConfigParams(l.href));
  const script = d.createElement('script');
  script.async = true;
  script.src = `${GTAG_SRC}${encodeURIComponent(measurementId)}`;
  d.head.appendChild(script);
  return true;
}

/** GA4's cookies: `_ga` and `_ga_<stream>`. */
const GA_COOKIE = /^_ga(_.+)?$/;

/** Expires every GA cookie on this host and its parent domains; returns the names found. */
export function clearGaCookies(doc: { cookie: string }, hostname: string): string[] {
  const names = doc.cookie
    .split(';')
    .map((pair) => pair.split('=')[0].trim())
    .filter((name) => GA_COOKIE.test(name));
  const labels = hostname.split('.');
  const domains = labels.map((_, i) => labels.slice(i).join('.')).filter((d) => d.includes('.'));
  for (const name of names) {
    doc.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) doc.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  }
  return names;
}

/**
 * Without a yes (never given, declined, withdrawn, or overridden by a privacy
 * signal): Consent Mode back to denied, GA4 switched off for this page, and its
 * cookies removed, including any left by the site before it asked (2026-10-01).
 */
export function stopGa(host: TagHost, measurementId: string): void {
  const w = host.window;
  if (typeof w.gtag === 'function') w.gtag('consent', 'update', CONSENT_DEFAULTS);
  w[`ga-disable-${measurementId}`] = true;
  clearGaCookies(host.document, host.location.hostname);
}
