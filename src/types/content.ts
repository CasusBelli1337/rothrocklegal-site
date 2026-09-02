/** Shared content shapes used by config, pages, and JSON-LD builders. */

export interface FaqItem {
  question: string;
  /** Plain text (no markdown): it is rendered as a paragraph and copied into FAQPage JSON-LD. */
  answer: string;
}

export interface Crumb {
  label: string;
  /** Omitted on the current page. */
  href?: string;
}

/** Library categories (CONTRACTS.md §6). */
export const LIBRARY_CATEGORIES = [
  "Deadlines",
  "Trust Contests",
  "Will Contests",
  "Undue Influence & Capacity",
  "Trustees & Fiduciaries",
  "Elder Financial Abuse",
  "Probate Process",
  "For Trustees",
  "Complex Estates",
  "Business Disputes",
  "Technology & the Law",
] as const;

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export function isLibraryCategory(value: string): value is LibraryCategory {
  return (LIBRARY_CATEGORIES as readonly string[]).includes(value);
}

/** 'Undue Influence & Capacity' → 'undue-influence-and-capacity' (chip + `?category=` slug). */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
