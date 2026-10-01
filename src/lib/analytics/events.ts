import { site } from '@/config/site';

/**
 * The GA4 events the site sends (#seam:ga4-events; mark each as a key event in GA4
 * Admin). An event never carries a parameter: its name is the whole message, so
 * nothing a visitor types, picks, or uploads can reach Google (privacy policy,
 * "Technical information").
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

/** True when the tag renders: a measurement id is set and this is not the editor preview. */
export function analyticsEnabled(): boolean {
  return Boolean(site.analyticsId) && process.env.NEXT_PUBLIC_PREVIEW_TOOLS !== '1';
}

type Gtag = (command: 'event', name: AnalyticsEvent) => void;

/** Counts one event. A no-op when the tag is off, blocked, or not loaded yet; never throws. */
export function trackEvent(name: AnalyticsEvent): void {
  if (typeof window === 'undefined' || !analyticsEnabled()) return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', name);
  } catch {
    // Analytics must never break the consult flow or the wizard.
  }
}
