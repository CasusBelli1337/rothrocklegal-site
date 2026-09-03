/**
 * The `TeamMember` contract (CONTRACTS.md §7) and the headshot path helper.
 * Member data files import from here; `src/config/team.ts` re-exports it so
 * `@/config/team` stays the one import path for the rest of the site.
 */

export interface TeamBadge {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * Which of a credential's listings this badge is for, when one credential
   * carries several (Best Lawyers lists two practice areas). The recognition
   * tiles show one badge per tile and print this in place of the credential's
   * `detail`.
   */
  detail?: string;
}

/** An award or list recognition, named exactly as conferred. Feeds Person `award[]`. */
export interface TeamCredential {
  /** e.g. 'Super Lawyers® Rising Stars'. */
  name: string;
  issuer: string;
  /** e.g. 'Northern California' or 'Commercial Litigation; Litigation – Trusts and Estates'. */
  detail?: string;
  years?: string;
  badges?: readonly TeamBadge[];
}

/** A held office (not an award). Feeds Person `memberOf` as an OrganizationRole. */
export interface TeamRole {
  role: string;
  organization: string;
  years?: string;
  /** Official art for the recognition tiles; a role without one is listed in the sidebar only. */
  badge?: TeamBadge;
}

export interface TeamEducation {
  school: string;
  degree: string;
  year?: string;
  /** Activities, honors, journals. */
  notes?: readonly string[];
}

export type AppearanceKind = 'talk' | 'article' | 'press' | 'podcast';

/** A curated speaking, press, or publication item for the bio page. */
export interface TeamAppearance {
  kind: AppearanceKind;
  /** Display date, e.g. 'October 2026' or 'May 2, 2025'. */
  date: string;
  /** ISO date for sorting. */
  sortDate: string;
  /** Outlet, venue, or host. */
  outlet: string;
  /** Talk title, headline, or session name. */
  title: string;
  /** Speaker, moderator, author, guest, quoted. */
  role?: string;
  /** Only where the dossier has a URL. */
  url?: string;
}

export interface TeamPodcast {
  name: string;
  role: string;
  /** Plain description, e.g. 'a podcast about building and running a litigation practice'. */
  description: string;
  url?: string;
  /** Cover art for the recognition tiles. */
  badge?: TeamBadge;
}

export interface TeamMember {
  slug: string;
  name: string;
  /** Exact title per the dossier. */
  title: string;
  /**
   * Bar status exactly as verified in the dossier. Undefined = not verified:
   * the site says nothing and JSON-LD emits no credential (CONTRACTS §4).
   */
  barStatus?: string;
  /** State Bar number, verified only. Drives `hasCredential` in JSON-LD. */
  barNumber?: string;
  /** One line for cards: 'Trust contests, undue influence, elder financial abuse'. */
  focus: string;
  /**
   * One verifiable fact for the team cards (show, not tell). Restates something
   * the bio already says; never a claim the dossier did not verify.
   */
  proofLine: string;
  /** 1–2 sentences for the meta description and Person JSON-LD. */
  summary: string;
  /** One line under the name on the bio page hero. */
  heroLine?: string;
  /** Bio paragraphs for the profile page, in order. */
  bio: readonly string[];
  image: { large: string; small: string; alt: string };
  email?: string;
  credentials: readonly TeamCredential[];
  leadership: readonly TeamRole[];
  education: readonly TeamEducation[];
  memberships: readonly string[];
  /**
   * Official art for the recognition tiles, keyed by the exact string in
   * `memberships`. A key with no matching membership fails the build.
   */
  membershipBadges?: Readonly<Record<string, TeamBadge>>;
  podcast?: TeamPodcast;
  appearances: readonly TeamAppearance[];
  /** State Bar licensee profile first, then LinkedIn (SEO-SPEC §3c). */
  sameAs: readonly string[];
  /** Practice-area slugs this person handles (bio links). */
  practices: readonly string[];
  updatedAt: string;
}

export function headshot(slug: string, alt: string): TeamMember['image'] {
  return {
    large: `/images/team/${slug}-800.webp`,
    small: `/images/team/${slug}-400.webp`,
    alt,
  };
}
