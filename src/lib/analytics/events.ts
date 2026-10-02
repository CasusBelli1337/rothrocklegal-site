import { site } from '@/config/site';
import { hasConsent } from '@/lib/consent/client';
import { counterEnabled } from './counter';

/**
 * The analytics events the site sends (#seam:ga4-events): to GA4 after a yes
 * (mark each as a key event in GA4 Admin) and to the firm's own counter
 * (site.counter, Umami's custom events). An event never carries a parameter: its
 * name is the whole message, so nothing a visitor types, picks, or uploads can
 * reach Google or the counter (privacy policy, "Technical information").
 */
export const ANALYTICS_EVENTS = {
  /** The consult flow created a session (the third start tile's Start). */
  consultStarted: 'consult_started',
  /** The consult request was sent (review screen's Send succeeded). */
  consultSubmitted: 'consult_submitted',
  /** The deadline wizard showed its results after the last question. */
  deadlineWizardCompleted: 'deadline_wizard_completed',
  /** A click on any mailto: link (the firm's or an attorney's address). */
  contactEmailClick: 'contact_email_click',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** True when the GA4 tag renders: a measurement id is set and this is not the editor preview. */
export function analyticsEnabled(): boolean {
  return Boolean(site.analyticsId) && process.env.NEXT_PUBLIC_PREVIEW_TOOLS !== '1';
}

type Gtag = (command: 'event', name: AnalyticsEvent) => void;
type Umami = { track?: (name: AnalyticsEvent) => unknown };
type AnalyticsWindow = Window & { gtag?: Gtag; umami?: Umami };

/**
 * GA4: before a yes to analytics (or after a no) the event is dropped, not
 * queued, so nothing is held back to send later.
 */
function sendToGa(w: AnalyticsWindow, name: AnalyticsEvent): void {
  if (!analyticsEnabled() || !hasConsent('analytics') || typeof w.gtag !== 'function') return;
  try {
    w.gtag('event', name);
  } catch {
    // Analytics must never break the consult flow or the wizard.
  }
}

/**
 * The counter: `window.umami` exists only where the loader ran, so a privacy
 * signal, /sign/, /schedule/, and a blocked script all leave it a no-op.
 */
function sendToCounter(w: AnalyticsWindow, name: AnalyticsEvent): void {
  if (!counterEnabled() || typeof w.umami?.track !== 'function') return;
  try {
    w.umami.track(name);
  } catch {
    // Same rule: counting never breaks the page.
  }
}

/** Counts one event in GA4 (only after a yes) and in the counter. Never throws. */
export function trackEvent(name: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  sendToGa(w, name);
  sendToCounter(w, name);
}
