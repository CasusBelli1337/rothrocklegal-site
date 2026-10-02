import { counterConfigured } from '@/lib/analytics/counter';
import { advertisingActive, type ConsentCategoryKey, consentCategory } from './consent';

/**
 * Every word of the privacy-choices bar, the footer link, and the advertising
 * sentences of the privacy policy (docs/CONSENT.md). Plain English for a worried
 * family member: no legalese, no em dash, sentences under about 25 words.
 * copy.test.ts holds this file to the voice guide.
 */

export const consentCopy = {
  eyebrow: 'Privacy choices',
  message:
    'May we count your visit with Google Analytics? It shows us which pages people read, never who you are. It stays off unless you say yes.',
  /** #seam:consent-advertising: replaces `message` once an advertising vendor is listed. */
  messageWithAdvertising:
    'May we count your visit with Google Analytics, and let an advertising partner show you our ads elsewhere? Each stays off unless you say yes.',
  accept: 'Accept analytics',
  decline: 'Decline',
  choose: 'Choose',
  save: 'Save choices',
  close: 'Close',
  /** Small print under the buttons; `label` is the footer link's current name. */
  changeLater: (label: string) => `Change this any time from ${label} at the bottom of every page.`,
  policyLink: 'Privacy Policy',
  /** Shown when the browser sends Global Privacy Control or Do Not Track. */
  signalNote: (signal: string) =>
    `Your browser sent a ${signal} signal, so we treat it as a no. Analytics stays off unless you turn it on here.`,
  signalNames: { gpc: 'Global Privacy Control', dnt: 'Do Not Track' },
  /** Announced to screen readers when a choice is saved. */
  saved: 'Your privacy choice is saved.',
  alwaysOn: 'Always on',
  on: 'On',
  off: 'Off',
} as const;

export interface CategoryCopy {
  label: string;
  description: string;
  /** Under the toggle while a privacy signal keeps the category off. */
  signalOff?: string;
}

export const consentCategoryCopy: Record<ConsentCategoryKey, CategoryCopy> = {
  necessary: {
    label: 'Needed for the site',
    description:
      'Keeps this choice, your reading options, and your progress in our forms. It also notes which topics you read, so the next pages fit. All of it stays on this device.',
  },
  analytics: {
    label: 'Analytics (Google Analytics)',
    description:
      'Counts visits and which pages people read, so we know what to write. It sets a cookie on this device and never tells us who you are.',
  },
  // #seam:consent-advertising: shown only once an advertising vendor is listed.
  advertising: {
    label: 'Advertising',
    description:
      'Lets an advertising partner remember your visit and show you our ads on other sites. California law calls this sharing your information.',
    signalOff: 'Off while your browser sends a privacy signal.',
  },
};

/**
 * The footer link's name (#seam:consent-advertising). Once advertising runs, the
 * same link is the CCPA opt-out link (Civ. Code § 1798.135(a)(1)).
 */
export const privacyChoicesLabels = {
  standard: 'Privacy choices',
  withAdvertising: 'Do Not Sell or Share My Personal Information',
} as const;

export function privacyChoicesLabel(): string {
  return advertisingActive() ? privacyChoicesLabels.withAdvertising : privacyChoicesLabels.standard;
}

/**
 * The privacy policy's advertising sentences (#seam:consent-advertising).
 * `withAdvertising` is a draft for the day an ad vendor is listed; have a lawyer
 * review it, and name the vendor, before that entry goes in.
 */
export const policyAdvertisingCopy = {
  /** The privacy policy's "short version" bullet. */
  shortNone: 'We do not sell your information or share it for advertising.',
  shortWithAdvertising:
    'We never sell what you send us. Advertising cookies run only if you say yes, and you can turn them off at any time.',
  none: 'No advertising cookies or social-media pixels run on this site today. If that ever changes, this policy will say so first, and they will run only if you say yes.',
  withAdvertising: (vendors: string) =>
    `If you say yes to advertising, ${vendors} may remember your visit and show you our ads on other sites. California law calls this sharing. A Global Privacy Control or Do Not Track signal always turns it off.`,
} as const;

/** The two advertising sentences the privacy policy prints today, chosen by config. */
export function policyAdvertising(): { short: string; full: string } {
  if (!advertisingActive()) {
    return { short: policyAdvertisingCopy.shortNone, full: policyAdvertisingCopy.none };
  }
  const vendors = consentCategory('advertising')
    .vendors.map((v) => v.name)
    .join(' and ');
  return {
    short: policyAdvertisingCopy.shortWithAdvertising,
    full: policyAdvertisingCopy.withAdvertising(vendors),
  };
}

/**
 * The firm's own visit counter (site.counter; docs/CONSENT.md "First-party
 * counter"). It is not a choice in the bar, so the bar only notes it in the small
 * print and never offers a switch for it. Shown only while site.counter is filled in.
 */
export const counterCopy = {
  /** The bar's small print, after `changeLater`. */
  barNote:
    'We also count visits ourselves, with no cookie, unless your browser sends a privacy signal.',
  /** The privacy policy's short version: completes "We collect only what you type, say, or upload". */
  shortVersion: 'and a count of visits we keep ourselves, with no cookie',
  /** The privacy policy's "Technical information" list. */
  technical:
    'We also keep our own count of visits, with software that runs on the firm’s own computer, not a third party’s. ' +
    'It sets no cookie and saves nothing on your device. ' +
    'It records which pages are read, the website that sent you, and general facts such as browser, type of device, language, and country. ' +
    'It counts the same few steps described above, with nothing you typed or chose attached. ' +
    'Your IP address is used for a moment to tell one visit from another, then dropped; it is never stored. ' +
    'If your browser sends Do Not Track or Global Privacy Control, the count leaves you out. ' +
    'It runs whatever you choose in the privacy choices bar, because it identifies no one.',
  /** "Cookies and your choices": why the bar does not ask about it. */
  cookies:
    'Our own visit count, described under Technical information, sets no cookie and stores nothing in your browser, so the bar does not ask about it.',
  /** After each Global Privacy Control and Do Not Track paragraph of the policy. */
  signal: 'Either signal also leaves you out of our own visit count.',
} as const;

/** The counter's sentences while site.counter is filled in; null once it is blanked. */
export function policyCounter(): typeof counterCopy | null {
  return counterConfigured() ? counterCopy : null;
}
