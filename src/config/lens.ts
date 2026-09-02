import type { SituationKey } from '@/lib/intake/contract';
import type { Lens } from '@/lib/lens/types';
import { categorySlug, type LibraryCategory } from '@/types/content';
import { trusteeAccountingFaq, trusteeFeesFaq } from './faq';

/**
 * Lens rules (docs/LENS.md). Every weight, threshold, and per-lens order lives
 * here; the code in src/lib/lens/ only reads it. Copy variants live in
 * lens-copy.ts. #seam:lens-config
 */

export const TRUSTEE_ANCHOR_SLUG = 'youre-the-trustee-and-a-beneficiary-is-threatening-to-sue';
export const NOTICE_ARTICLE_PATH = '/library/how-to-serve-notification-by-trustee-16061-7/';

/** The seven beneficiary-side practice pages. The keys double as intake situation keys. */
export const BENEFICIARY_PRACTICES = [
  'trust-contests',
  'will-contests',
  'undue-influence-and-capacity',
  'breach-of-fiduciary-duty',
  'trust-accounting-disputes',
  'estate-property-disputes',
  'financial-elder-abuse',
] as const;

export const BENEFICIARY_CATEGORIES: readonly LibraryCategory[] = [
  'Trust Contests',
  'Will Contests',
  'Undue Influence & Capacity',
  'Trustees & Fiduciaries',
  'Elder Financial Abuse',
];

export interface EventRule {
  prefix: string;
  /** Exact suffix → weight. */
  exact?: Readonly<Record<string, number>>;
  /** Weight for any other suffix; 0 (or absent) means no signal. */
  otherwise?: number;
  /** Exact suffix → the score is set to this outright. */
  set?: Readonly<Record<string, number>>;
}

export interface LensConfig {
  storageKey: string;
  landingKey: string;
  seededKey: string;
  /** Score at or above → trustee; at or below `beneficiaryAt` → beneficiary; between → neutral. */
  trusteeAt: number;
  beneficiaryAt: number;
  /** The score never runs past ±scoreLimit, so a few clicks the other way always flip it back. */
  scoreLimit: number;
  maxSignals: number;
  /** The same key within this window is not counted twice. */
  dedupeWindowMs: number;
  /** Landing weight per path; navigation later counts half (toward zero, never below ±1). */
  pathWeights: Readonly<Record<string, number>>;
  /** Landing weight for /library/<slug>/ by the article's category. */
  categoryWeights: Readonly<Record<LibraryCategory, number>>;
  events: readonly EventRule[];
  /** Homepage problem cards moved to the front under a lens; the rest keep HOMEPAGE-SPEC order. */
  cardsFirst: Partial<Record<Lens, readonly string[]>>;
  /** Homepage FAQ questions moved to the front under a lens. */
  faqFirst: Partial<Record<Lens, readonly string[]>>;
  /** Homepage library preview: categories per lens (undefined = newest of everything). */
  previewCategories: Record<Lens, readonly LibraryCategory[] | undefined>;
  /** Slugs pinned to the front of a lens's preview when present. */
  previewPinned: Partial<Record<Lens, readonly string[]>>;
  /** /library/ featured card per lens; neutral keeps the deadlines anchor. */
  featuredSlug: Partial<Record<Lens, string>>;
  /** Situations pre-checked (still editable) on the consult flow. */
  intakePreselect: Partial<Record<Lens, readonly SituationKey[]>>;
}

function weights(keys: readonly string[], weight: number): Record<string, number> {
  return Object.fromEntries(keys.map((key) => [key, weight]));
}

export const lensConfig: LensConfig = {
  storageKey: 'rl-lens',
  landingKey: 'rl-lens-landed',
  seededKey: 'rl-lens-seeded',
  trusteeAt: 2,
  beneficiaryAt: -2,
  scoreLimit: 6,
  maxSignals: 30,
  dedupeWindowMs: 10 * 60 * 1000,
  pathWeights: {
    '/for-trustees/': 2,
    ...weights(
      BENEFICIARY_PRACTICES.map((slug) => `/${slug}/`),
      -2,
    ),
    '/complex-estates/': 0,
    '/trust-litigation/': 0,
    '/business-disputes/': 0,
    '/': 0,
    '/about/': 0,
    '/library/': 0,
    '/how-long-do-i-have/': 0,
    '/request-a-consult/': 0,
  },
  categoryWeights: {
    'For Trustees': 2,
    'Complex Estates': 0,
    Deadlines: 0,
    'Probate Process': 0,
    'Technology & the Law': 0,
    'Business Disputes': 0,
    ...weights(BENEFICIARY_CATEGORIES, -2),
  } as Record<LibraryCategory, number>,
  events: [
    { prefix: 'card:', exact: { 'for-trustees': 2 }, otherwise: -2 },
    {
      prefix: 'chip:',
      exact: { 'for-trustees': 1, ...weights(BENEFICIARY_CATEGORIES.map(categorySlug), -1) },
    },
    { prefix: 'wizard:relationship:', exact: { 'trustee-or-executor': 3 }, otherwise: -2 },
    {
      prefix: 'intake:situation:',
      exact: { 'for-trustees': 3, ...weights(BENEFICIARY_PRACTICES, -2) },
    },
    { prefix: 'switch:', set: { trustee: 3, beneficiary: -3 } },
  ],
  cardsFirst: { trustee: ['for-trustees'] },
  faqFirst: { trustee: [trusteeFeesFaq.question, trusteeAccountingFaq.question] },
  previewCategories: {
    neutral: undefined,
    trustee: ['For Trustees', 'Complex Estates'],
    beneficiary: BENEFICIARY_CATEGORIES,
  },
  previewPinned: { trustee: [TRUSTEE_ANCHOR_SLUG] },
  featuredSlug: { trustee: TRUSTEE_ANCHOR_SLUG },
  intakePreselect: { trustee: ['for-trustees'] },
};
