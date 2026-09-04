/**
 * Which browser and device the person is using, from the user agent. Only as
 * fine as the microphone help needs: the permission switch lives in a
 * different place in each of these, and a phone can take photos of papers.
 */

export type BrowserKind =
  | 'chrome-desktop'
  | 'edge'
  | 'safari-mac'
  | 'firefox'
  | 'safari-ios'
  | 'chrome-android'
  | 'samsung'
  | 'unknown';

export type DeviceKind = 'phone' | 'tablet' | 'desktop';

export interface BrowserInfo {
  kind: BrowserKind;
  device: DeviceKind;
}

export interface BrowserHints {
  /** `navigator.maxTouchPoints`; an iPad reports itself as a Macintosh but has touch. */
  maxTouchPoints?: number;
}

export const UNKNOWN_BROWSER: BrowserInfo = { kind: 'unknown', device: 'desktop' };

/** Ordered: the first matching pattern wins (Edge and Samsung also say "Chrome"). */
const BROWSER_RULES: readonly { test: RegExp; kind: BrowserKind }[] = [
  { test: /SamsungBrowser\//, kind: 'samsung' },
  { test: /\bEdgA?\//, kind: 'edge' },
  { test: /\bFirefox\//, kind: 'firefox' },
  { test: /\bAndroid\b.*\bChrome\//, kind: 'chrome-android' },
  { test: /\bChrome\//, kind: 'chrome-desktop' },
  { test: /\bMacintosh\b.*\bSafari\//, kind: 'safari-mac' },
];

function isIos(ua: string, hints: BrowserHints): boolean {
  if (/\b(iPhone|iPad|iPod)\b/.test(ua)) return true;
  return /\bMacintosh\b/.test(ua) && (hints.maxTouchPoints ?? 0) > 1;
}

function deviceOf(ua: string, ios: boolean, hints: BrowserHints): DeviceKind {
  if (/\biPhone\b|\biPod\b/.test(ua)) return 'phone';
  if (ios) return 'tablet';
  if (/\bAndroid\b/.test(ua)) return /\bMobile\b/.test(ua) ? 'phone' : 'tablet';
  if (/\bMobile\b/.test(ua)) return 'phone';
  return (hints.maxTouchPoints ?? 0) > 1 && /\bTablet\b/i.test(ua) ? 'tablet' : 'desktop';
}

/** Every browser on iOS uses Safari's engine and iOS's microphone permission; only Safari itself gets Safari's steps. */
function iosKind(ua: string): BrowserKind {
  return /\b(CriOS|FxiOS|EdgiOS|OPT)\//.test(ua) ? 'unknown' : 'safari-ios';
}

export function detectBrowser(ua: string, hints: BrowserHints = {}): BrowserInfo {
  const ios = isIos(ua, hints);
  const device = deviceOf(ua, ios, hints);
  if (ios) return { kind: iosKind(ua), device };
  const rule = BROWSER_RULES.find((r) => r.test.test(ua));
  return { kind: rule?.kind ?? 'unknown', device };
}

/** Reads the current browser; safe on the server (returns unknown). */
export function currentBrowser(): BrowserInfo {
  if (typeof navigator === 'undefined') return UNKNOWN_BROWSER;
  return detectBrowser(navigator.userAgent, { maxTouchPoints: navigator.maxTouchPoints });
}

/** False only on a plain http address (other than localhost), where browsers refuse the microphone. */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext !== false;
}
