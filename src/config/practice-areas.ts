import type { FaqItem, LibraryCategory } from "@/types/content";
import { breachOfFiduciaryDuty } from "./practice/breach-of-fiduciary-duty";
import { businessDisputes } from "./practice/business-disputes";
import { complexEstates } from "./practice/complex-estates";
import { estatePropertyDisputes } from "./practice/estate-property-disputes";
import { financialElderAbuse } from "./practice/financial-elder-abuse";
import { forTrustees } from "./practice/for-trustees";
import { trustAccountingDisputes } from "./practice/trust-accounting-disputes";
import { trustContests } from "./practice/trust-contests";
import { trustLitigation } from "./practice/trust-litigation";
import { undueInfluenceAndCapacity } from "./practice/undue-influence-and-capacity";
import { willContests } from "./practice/will-contests";

/** Line-icon keys rendered by `ProblemCard` (src/components/icons.tsx). */
export type PracticeIcon =
  | "pen"
  | "ledger"
  | "pulse"
  | "home"
  | "coins"
  | "file-x"
  | "box"
  | "users"
  | "briefcase"
  | "shield"
  | "layers";

export interface Statute {
  /** e.g. 'Probate Code § 16061.8' */
  cite: string;
  /** One plain sentence: what it does for the reader. */
  plain: string;
}

export interface PracticeArea {
  slug: string;
  /** Short noun name for breadcrumbs, footer, related links: 'Trust contests'. */
  title: string;
  /** The H1: the reader's problem as a claim or question. */
  headline: string;
  /** `<title>` before the brand suffix (SEO-SPEC §4). */
  seoTitle: string;
  /** Meta description, ≤ 155 chars. */
  description: string;
  /** Answer-first intro: 40–60 words, names the statute or deadline. */
  summary: string;
  /** Homepage problem card (HOMEPAGE-SPEC §3) and the italic line on the About grid. `href` overrides the page link. */
  card?: {
    headline: string;
    answer: string;
    icon: PracticeIcon;
    href?: string;
  };
  /** "How fast you need to move" in two sentences. */
  deadline: { headline: string; body: string };
  statutes: readonly Statute[];
  faq: readonly FaqItem[];
  /** Library categories used for "related reading". */
  categories: readonly LibraryCategory[];
  parent?: "trust-litigation";
  hub?: boolean;
  secondary?: boolean;
  author: "arthur-rothrock";
  updatedAt: string;
}

/** Nav / footer order (IA.md §2): hub first, then the nine pages, business last. */
export const practiceAreas: readonly PracticeArea[] = [
  trustLitigation,
  trustContests,
  willContests,
  undueInfluenceAndCapacity,
  breachOfFiduciaryDuty,
  trustAccountingDisputes,
  estatePropertyDisputes,
  financialElderAbuse,
  forTrustees,
  complexEstates,
  businessDisputes,
];

export const practiceHub = trustLitigation;

/** The nine spoke pages plus business, in nav order (no hub). */
export const practicePages: readonly PracticeArea[] = practiceAreas.filter(
  (a) => !a.hub,
);

/** Primary trust-and-estate pages only (no hub, no business). */
export const primaryPractices: readonly PracticeArea[] = practicePages.filter(
  (a) => !a.secondary,
);

export function getPracticeArea(slug: string): PracticeArea {
  const area = practiceAreas.find((a) => a.slug === slug);
  if (!area) throw new Error(`No practice area with slug "${slug}"`);
  return area;
}

export function practiceHref(area: Pick<PracticeArea, "slug">): string {
  return `/${area.slug}/`;
}

if (practiceAreas.length !== 11) {
  throw new Error(`Expected 11 practice areas, found ${practiceAreas.length}`);
}
