/**
 * Team config (CONTRACTS.md §7). Key = slug. Each member lives in
 * `src/config/team/<slug>.ts`; this file owns the `TeamMember` contract and
 * the ordered list. Anything containing [CONFIRM] is unverified: components
 * may render it during review, but JSON-LD builders drop it (see
 * src/lib/seo/jsonld.ts `verified`).
 */

import { arthurRothrock } from './team/arthur-rothrock';
import { gerryLin } from './team/gerry-lin';
import { jonathanJoannides } from './team/jonathan-joannides';
import { maxDischer } from './team/max-discher';
import type { TeamCredential, TeamMember } from './team/member';

export type {
  AppearanceKind,
  Framed,
  TeamAppearance,
  TeamBadge,
  TeamCredential,
  TeamEducation,
  TeamMember,
  TeamPodcast,
  TeamRole,
} from './team/member';
export { framings, headshot, isFramed } from './team/member';

/** Arthur first (HOMEPAGE-SPEC §4), then the team in the dossier's order. */
export const team: readonly TeamMember[] = [
  arthurRothrock,
  jonathanJoannides,
  gerryLin,
  maxDischer,
];

export function getTeamMember(slug: string): TeamMember {
  const member = team.find((m) => m.slug === slug);
  if (!member) throw new Error(`No team member with slug "${slug}"`);
  return member;
}

export function teamHref(member: Pick<TeamMember, 'slug'>): string {
  return `/attorneys/${member.slug}/`;
}

/** 'Arthur E. Rothrock' → 'Arthur'. */
export function firstName(member: Pick<TeamMember, 'name'>): string {
  return member.name.split(/\s+/)[0];
}

/** 'Super Lawyers® Rising Stars, Northern California (2020–2026)' – one string for chips and JSON-LD. */
export function credentialLabel(c: TeamCredential): string {
  const name = c.detail ? `${c.name}, ${c.detail}` : c.name;
  return c.years ? `${name} (${c.years})` : name;
}

/** True while any field still carries a [CONFIRM] placeholder (profile renders a draft chip + noindex). */
export function hasPlaceholders(member: TeamMember): boolean {
  return JSON.stringify(member).includes('[CONFIRM]');
}

/** Members who hold an award, for the recognition strips. */
export function recognizedMembers(): TeamMember[] {
  return team.filter((m) => m.credentials.length > 0);
}

if (team.length !== 4) {
  throw new Error(`Expected 4 team members, found ${team.length}`);
}
