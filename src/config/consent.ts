import { site } from './site';

/**
 * Privacy choices (docs/CONSENT.md): which trackers may run, and only after a
 * visitor says yes. Config over code: the banner, the footer link, the GA4
 * loader, the boot script, and the privacy policy all read this file.
 *
 * Turning on advertising (#seam:consent-advertising) is one entry in
 * `advertising.vendors` below. That alone shows the advertising toggle, flips the
 * footer link to "Do Not Sell or Share My Personal Information", and swaps the
 * privacy policy's advertising sentence; docs/CONSENT.md lists what else to check.
 */

export type OptionalCategory = 'analytics' | 'advertising';
export type ConsentCategoryKey = 'necessary' | OptionalCategory;

export interface ConsentVendor {
  name: string;
  /** The vendor's own privacy policy, linked from the privacy policy. */
  privacyUrl: string;
}

export interface ConsentCategory {
  key: ConsentCategoryKey;
  /** Always on and never asked about: storage that never leaves the browser. */
  required: boolean;
  /**
   * A "sale" or "sharing" under the CCPA (Civ. Code § 1798.140(ad), (ah)): a Global
   * Privacy Control or Do Not Track signal always switches it off, even after a yes.
   */
  saleOrShare: boolean;
  /** No vendor means the category is not offered and can never be granted. */
  vendors: readonly ConsentVendor[];
}

export const consentConfig = {
  storageKey: 'rl-consent',
  /** Bump when the categories or what they mean change: every visitor is asked again. */
  version: 1,
  /** A choice is asked again after this long (12 months). */
  maxAgeDays: 365,
  /** The bar's id: the footer link and the reopen controls point at it. */
  barId: 'privacy-choices',
} as const;

export const consentCategories: readonly ConsentCategory[] = [
  { key: 'necessary', required: true, saleOrShare: false, vendors: [] },
  {
    key: 'analytics',
    required: false,
    saleOrShare: false,
    vendors: site.analyticsId
      ? [{ name: 'Google Analytics', privacyUrl: 'https://policies.google.com/privacy' }]
      : [],
  },
  {
    // #seam:consent-advertising: add the ad vendor here (e.g. { name: 'Meta Pixel',
    // privacyUrl: 'https://www.facebook.com/privacy/policy/' }) only after the steps
    // in docs/CONSENT.md "Turning on advertising".
    key: 'advertising',
    required: false,
    saleOrShare: true,
    vendors: [],
  },
];

export function consentCategory(key: ConsentCategoryKey): ConsentCategory {
  const category = consentCategories.find((c) => c.key === key);
  if (!category) throw new Error(`No consent category "${key}"`);
  return category;
}

/** The categories a visitor is actually asked about: optional and backed by a vendor. */
export function offeredCategories(): readonly ConsentCategory[] {
  return consentCategories.filter((c) => !c.required && c.vendors.length > 0);
}

export function isOffered(key: ConsentCategoryKey): boolean {
  return offeredCategories().some((c) => c.key === key);
}

/** True once an advertising vendor is listed (#seam:consent-advertising). */
export function advertisingActive(): boolean {
  return isOffered('advertising');
}
