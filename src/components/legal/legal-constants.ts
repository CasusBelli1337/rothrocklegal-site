/**
 * Facts the privacy policy and disclaimer cite (config over code, CONTRACTS.md §3).
 * Sources and the clause-by-clause map: rothrock-legal/redesign/legal-pages/LEGAL-PAGES-CHECK.md.
 */
export const legal = {
  /** CalOPPA requires an effective date (Bus. & Prof. Code § 22575(b)(4)). */
  effectiveDate: 'September 2, 2026',
  /** Unsent consult drafts are purged nightly after this many days (INTAKE-SPEC §7). */
  draftPurgeDays: 30,
  /**
   * How long a consult request we do not take is kept after our last contact.
   * PROPOSED 12 months, pending Arthur's decision (LEGAL-PAGES-CHECK.md, open items).
   */
  declinedRetentionMonths: 12,
  /** Upload limits, mirrored from src/lib/intake/document-slots.ts. */
  maxUploadMb: 25,
  maxUploadFiles: 20,
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
