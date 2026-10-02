import { MAX_FILE_MB, MAX_FILES } from '@/lib/intake/document-slots';

/**
 * Facts the privacy policy and disclaimer cite (config over code, CONTRACTS.md §3).
 * Sources and the clause-by-clause map: rothrock-legal/redesign/legal-pages/LEGAL-PAGES-CHECK.md.
 */
export const legal = {
  /**
   * CalOPPA requires an effective date (Bus. & Prof. Code § 22575(b)(4)). ISO dates;
   * pages print them with formatDate and sitemap.xml uses them as lastmod.
   * `effectiveDate` is the disclaimer's and the accessibility statement's.
   */
  effectiveDate: '2026-09-16',
  /** The privacy policy's own date: moved for the GA4 event counts (2026-10-01). */
  privacyEffectiveDate: '2026-10-01',
  /** Unsent consult drafts are purged nightly after this many days (INTAKE-SPEC §7). */
  draftPurgeDays: 30,
  /**
   * How long a consult request we do not take is kept after our last contact.
   * PROPOSED 12 months, pending Arthur's decision (LEGAL-PAGES-CHECK.md, open items).
   */
  declinedRetentionMonths: 12,
  /** Upload limits: the same constants the documents step and the server enforce. */
  maxUploadMb: MAX_FILE_MB,
  maxUploadFiles: MAX_FILES,
  ai: {
    provider: 'Anthropic',
    commercialTermsUrl: 'https://www.anthropic.com/legal/commercial-terms',
    trainingPolicyUrl:
      'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
    retentionPolicyUrl:
      'https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data',
  },
  host: {
    name: 'GitHub Pages',
    dataCollectionUrl:
      'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages',
  },
} as const;
