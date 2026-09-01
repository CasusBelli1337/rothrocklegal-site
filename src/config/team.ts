/**
 * Team config (CONTRACTS.md §7). Key = slug. The team builder overwrites the
 * data in this file from TEAM-DOSSIER.md; the `TeamMember` type is the contract.
 * Anything containing [CONFIRM] is unverified: components may render it during
 * review, but JSON-LD builders drop it (see src/lib/seo/jsonld.ts `verified`).
 */

export interface TeamCredential {
  /** Exactly as conferred, e.g. 'Super Lawyers® Rising Stars (Northern California)'. */
  name: string;
  issuer: string;
  years?: string;
}

export interface TeamEducation {
  school: string;
  degree: string;
  year?: string;
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
  /** 1–2 sentences for the meta description and Person JSON-LD. */
  summary: string;
  image: { large: string; small: string; alt: string };
  email?: string;
  credentials: readonly TeamCredential[];
  education: readonly TeamEducation[];
  memberships: readonly string[];
  /** State Bar licensee profile first, then LinkedIn (SEO-SPEC §3c). */
  sameAs: readonly string[];
  /** Practice-area slugs this person handles (bio links). */
  practices: readonly string[];
  updatedAt: string;
}

function headshot(slug: string, alt: string): TeamMember["image"] {
  return {
    large: `/images/team/${slug}-800.webp`,
    small: `/images/team/${slug}-400.webp`,
    alt,
  };
}

export const team: readonly TeamMember[] = [
  {
    slug: "arthur-rothrock",
    name: "Arthur E. Rothrock",
    title: "Founder",
    barStatus: "Attorney, State Bar of California (admitted 2016)",
    barNumber: "312704",
    focus: "Trust contests, undue influence, elder financial abuse",
    summary:
      "Trial lawyer and founder of Rothrock Legal in San Jose. Co-founder and CEO of Legion, an AI " +
      "litigation platform, and Vice Chair of the American Bar Association's Artificial " +
      "Intelligence and Robotics National Institute.",
    image: headshot(
      "arthur-rothrock",
      "Arthur E. Rothrock, founder of Rothrock Legal",
    ),
    email: "arothrock@rothrocklegal.com",
    credentials: [
      {
        name: "Super Lawyers® Rising Stars (Northern California)",
        issuer: "Super Lawyers",
        years: "2020–2026",
      },
      {
        name: "Best Lawyers: Ones to Watch® in America",
        issuer: "Best Lawyers",
        years: "2024–2027",
      },
      {
        name: "Vice Chair, American Bar Association's Artificial Intelligence and Robotics National Institute",
        issuer: "American Bar Association",
        years: "2026",
      },
    ],
    education: [
      {
        school: "Santa Clara University School of Law",
        degree: "J.D.",
        year: "2016",
      },
      { school: "Indiana University of Pennsylvania", degree: "B.A." },
    ],
    memberships: [
      "Honorable William A. Ingram American Inn of Court",
      "Santa Clara County Bar Association",
    ],
    sameAs: [
      "https://apps.calbar.ca.gov/attorney/Licensee/Detail/312704",
      "https://www.linkedin.com/in/rothrocka/",
      "https://profiles.superlawyers.com/california/san-jose/lawyer/arthur-e-rothrock/91f0080b-4f03-435c-bd78-14522f3be1fd.html",
      "https://www.bestlawyers.com/lawyers/arthur-rothrock/351520",
    ],
    practices: [
      "trust-contests",
      "will-contests",
      "undue-influence-and-capacity",
      "breach-of-fiduciary-duty",
      "financial-elder-abuse",
      "business-disputes",
    ],
    updatedAt: "2026-09-01",
  },
  {
    slug: "gerry-lin",
    name: "Gerry Lin",
    title: "[CONFIRM] Title",
    focus: "[CONFIRM] Focus line",
    summary:
      "[CONFIRM] One or two sentences about Gerry Lin from the team dossier.",
    image: headshot("gerry-lin", "Gerry Lin of Rothrock Legal"),
    email: "glin@rothrocklegal.com",
    credentials: [],
    education: [],
    memberships: [],
    sameAs: [],
    practices: ["trust-accounting-disputes", "breach-of-fiduciary-duty"],
    updatedAt: "2026-09-01",
  },
  {
    slug: "jonathan-joannides",
    name: 'Jonathan "JJ" Joannides',
    title: "[CONFIRM] Title",
    focus: "[CONFIRM] Focus line",
    summary:
      "[CONFIRM] One or two sentences about Jonathan Joannides from the team dossier.",
    image: headshot(
      "jonathan-joannides",
      'Jonathan "JJ" Joannides of Rothrock Legal',
    ),
    email: "jonathan@rothrocklegal.com",
    credentials: [],
    education: [],
    memberships: [],
    sameAs: [],
    practices: ["estate-property-disputes", "will-contests"],
    updatedAt: "2026-09-01",
  },
  {
    slug: "max-discher",
    name: "Max Discher",
    title: "[CONFIRM] Title",
    focus: "[CONFIRM] Focus line",
    summary:
      "[CONFIRM] One or two sentences about Max Discher from the team dossier.",
    image: headshot("max-discher", "Max Discher of Rothrock Legal"),
    credentials: [],
    education: [],
    memberships: [],
    sameAs: [],
    practices: ["financial-elder-abuse", "undue-influence-and-capacity"],
    updatedAt: "2026-09-01",
  },
] as const;

export function getTeamMember(slug: string): TeamMember {
  const member = team.find((m) => m.slug === slug);
  if (!member) throw new Error(`No team member with slug "${slug}"`);
  return member;
}

export function teamHref(member: Pick<TeamMember, "slug">): string {
  return `/attorneys/${member.slug}/`;
}
