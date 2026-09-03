/**
 * Single source of truth for site-wide values (CONTRACTS.md §3).
 * Change firm details, nav, footer, palette, and canonical host here, never in components.
 */

export const site = {
  name: 'Rothrock Legal',
  /** Canonical production host. */
  canonicalHost: 'https://www.rothrocklegal.com',
  /** One sentence used by the homepage meta description and the LegalService JSON-LD. */
  description:
    'Trust contests, will contests, undue influence, trustee disputes, and elder financial abuse ' +
    'for families in San Jose, Santa Clara County, and the Bay Area.',
  defaultTitle: 'Trust & Estate Litigation Attorneys in San Jose | Rothrock Legal',
  tagline:
    'Trust and estate litigation for families in San Jose, Santa Clara County, and the San Francisco Bay Area.',
  /** Shown as text only (footer, /contact/), never as a tel: button: Arthur does not field calls. */
  phone: '(408) 420-7034',
  phoneE164: '+1-408-420-7034',
  email: 'arothrock@rothrocklegal.com',
  /** Contact-form CCs so a submission is never missed by a single inbox. */
  formCc: ['jonathan@rothrocklegal.com', 'glin@rothrocklegal.com'],
  /** Office facts shown on the page and mirrored in JSON-LD (SEO-SPEC §3a). No street address. */
  office: {
    city: 'San Jose',
    region: 'CA',
    regionName: 'California',
    country: 'US',
    appointments:
      'We meet by video. No office visits, no parking, no waiting rooms. San Jose, California.',
  },
  hours: 'Mon to Fri, by appointment. Send a consult request any time.',
  /** Attorney responsible for the site (Rule 7.2(c); Bus. & Prof. Code § 6157.2(b)). */
  responsibleAttorney: 'Arthur E. Rothrock',
  /** The reply-time promise, one full sentence, used verbatim everywhere (Arthur, 2026-09-01). */
  replyPromise: 'We strive to respond within one business day.',
  /** Sits beside the phone number, which is text and never a button: Arthur does not field calls. */
  consultLine: 'The fastest way to reach us is a consult request. We read every one.',
  /** "What happens next" after a consult request or a note (/contact/, thank-you page). */
  nextSteps: [
    'We read it.',
    'We run a conflict check.',
    'We strive to reply by email within one business day.',
  ],
  /**
   * Show `draft: true` articles (chip "Draft – pending attorney review",
   * noindex) in the library index, homepage preview, related reading, and
   * article routes. Flip to false when the site ships; sitemap.xml and
   * llms.txt never list drafts either way.
   */
  showDraftArticles: true,
  /**
   * The privacy policy and disclaimer are drafts until Arthur signs off: they
   * show the draft notice, render noindex, and stay out of sitemap.xml and
   * llms.txt. Set false to publish both.
   */
  legalPagesDraft: false,
  resultsDisclaimer: 'Every case is different. Past results do not guarantee a similar outcome.',
  ogImage: '/images/og/site.png',
  copyrightYear: 2026,
  /** Bumped only for substantive edits to static pages (sitemap lastModified). */
  lastUpdated: '2026-09-01',
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Problem-led one-liner shown under a dropdown row. */
  sublabel?: string;
  children?: readonly NavItem[];
}

/** Header navigation (IA.md §2). The Header renders whichever shape it gets. */
export const nav: readonly NavItem[] = [
  {
    label: 'Trust & Estate Litigation',
    href: '/trust-litigation/',
    children: [
      {
        label: 'Contesting a trust',
        href: '/trust-contests/',
        sublabel: "Someone changed the trust and it doesn't add up",
      },
      {
        label: 'Contesting a will',
        href: '/will-contests/',
        sublabel: "The will isn't what Mom or Dad said it would be",
      },
      {
        label: 'Undue influence & capacity',
        href: '/undue-influence-and-capacity/',
        sublabel: 'Someone got to them when they were vulnerable',
      },
      {
        label: 'Trustees who break the rules',
        href: '/breach-of-fiduciary-duty/',
        sublabel: 'The trustee is self-dealing or stalling',
      },
      {
        label: 'Accountings & information',
        href: '/trust-accounting-disputes/',
        sublabel: "The trustee won't show us the numbers",
      },
      {
        label: 'Property disputes (§ 850)',
        href: '/estate-property-disputes/',
        sublabel: 'The house or the accounts were moved out',
      },
      {
        label: 'Financial elder abuse',
        href: '/financial-elder-abuse/',
        sublabel: "Someone is draining an elder's money",
      },
      {
        label: 'Representing trustees',
        href: '/for-trustees/',
        sublabel: "You're the trustee and a beneficiary is coming after you",
      },
      {
        label: 'Complex & high-value estates',
        href: '/complex-estates/',
        sublabel: 'Multiple properties, an LLC, a family business',
      },
      {
        label: 'Business & partnership disputes',
        href: '/business-disputes/',
        sublabel: 'A partner or co-owner broke the deal',
      },
    ],
  },
  { label: 'How Long Do I Have?', href: '/how-long-do-i-have/' },
  { label: 'Attorneys', href: '/attorneys/' },
  { label: 'Library', href: '/library/' },
  { label: 'About', href: '/about/' },
] as const;

/** The primary action on every page: the consult request (Arthur does not field calls). */
export const consultCta: NavItem = {
  label: 'Request a consult',
  href: '/request-a-consult/',
};

/** The secondary action: the short contact form. */
export const noteCta: NavItem = {
  label: 'Tell us your story',
  href: '/contact/',
};

/**
 * Homepage settings. `deadlinePhotos` pins the four attorney headshots to the
 * corners of the deadline card (Arthur, 2026-09-02); set false to remove them
 * in one edit, for example when commissioned photography replaces them.
 */
export const homepage = {
  deadlinePhotos: true,
} as const;

/** Footer "Resources" column (IA.md §3). Practice links come from practice-areas.ts. */
export const footerResources: readonly NavItem[] = [
  { label: 'How Long Do I Have?', href: '/how-long-do-i-have/' },
  { label: 'Library', href: '/library/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Where We Practice', href: '/service-areas/' },
  { label: 'Attorneys', href: '/attorneys/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const legalLinks: readonly NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
  { label: 'Accessibility', href: '/accessibility/' },
  // The firm's internal portal (Google Workspace sign-in at the edge); a link,
  // never a description, per the copy rules.
  { label: 'Attorney Portal', href: 'https://portal.rothrocklegal.com/' },
] as const;

export const social = {
  linkedin: 'https://www.linkedin.com/in/rothrocka/',
  /**
   * Firm-level profiles for LegalService `sameAs` (ARTHUR-DOSSIER.md §15).
   * Arthur's personal LinkedIn stands in for the firm until a LinkedIn Company
   * Page, the Google Business Profile, Avvo, Justia, and State Bar firm URLs
   * exist; add those here when they do, never before (local-SEO memo, 2026-09-01).
   */
  firmProfiles: [
    'https://www.linkedin.com/in/rothrocka/',
    'https://profiles.superlawyers.com/california/san-jose/lawfirm/rothrock-legal/3a179706-d225-41e9-aa54-4d24707b0788.html',
    'https://www.bestlawyers.com/firms/rothrock-legal/106701/US',
  ],
} as const;

/** Mirror of the `@theme` tokens in globals.css (DESIGN-BRIEF §2). */
export const palette = {
  maroon950: '#2B0119',
  maroon900: '#3F0226',
  maroon800: '#52032F',
  maroon700: '#66043D',
  maroon600: '#7F1A55',
  maroon500: '#98366F',
  /** Text selection: maroon-700 at 18% alpha. Tints retired 2026-09-02. */
  highlight: '#66043D2E',
  paper: '#F8F5F0',
  sand: '#EFEAE2',
  white: '#FFFFFF',
  line: '#E2DBD1',
  lineStrong: '#CBC2B5',
  ink: '#1B1816',
  ink2: '#3F3A36',
  ink3: '#6B645E',
  ink4: '#8F877F',
  brass600: '#8C6212',
  brass500: '#B07A1C',
  brass400: '#C9932B',
  brass100: '#F5EAD2',
  success: '#2E6B4E',
  error: '#B42318',
} as const;

/** Prefix a public asset path with the basePath injected by CI or the editor preview. */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
}
