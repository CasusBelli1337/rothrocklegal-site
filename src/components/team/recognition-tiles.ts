/**
 * The recognition tiles (About page and the attorney profile): one tile per
 * piece of official badge art on a member's record, in the record's order.
 * Credentials first, then held offices, memberships, and the podcast. Items
 * without art stay in the profile sidebar's plain lists.
 */

import type { TeamBadge, TeamCredential, TeamMember } from '@/config/team';

export interface RecognitionTile {
  key: string;
  /** Brass eyebrow: 'Award' for a credential, otherwise the held role ('Vice Chair', 'Member', 'Host'). */
  kind: string;
  badge: TeamBadge;
  /** The name exactly as conferred. */
  name: string;
  detail?: string;
  /** Years and issuer, e.g. '2020–2026 · Super Lawyers (Thomson Reuters)'. */
  meta?: string;
  /** The podcast tile links out to the show. */
  href?: string;
}

function credentialTiles(c: TeamCredential): RecognitionTile[] {
  return (c.badges ?? []).map((badge) => ({
    key: `credential:${badge.src}`,
    kind: 'Award',
    badge,
    name: c.name,
    detail: badge.detail ?? c.detail,
    meta: c.years ? `${c.years} · ${c.issuer}` : c.issuer,
  }));
}

function roleTiles(member: TeamMember): RecognitionTile[] {
  return member.leadership.flatMap((r) =>
    r.badge
      ? [
          {
            key: `role:${r.role}:${r.organization}`,
            kind: r.role,
            badge: r.badge,
            name: r.organization,
            meta: r.years,
          },
        ]
      : [],
  );
}

function membershipTiles(member: TeamMember): RecognitionTile[] {
  const badges = member.membershipBadges ?? {};
  for (const name of Object.keys(badges)) {
    if (!member.memberships.includes(name)) {
      throw new Error(`${member.slug}: membershipBadges["${name}"] has no entry in memberships`);
    }
  }
  return member.memberships.flatMap((name) => {
    const badge = badges[name];
    return badge ? [{ key: `membership:${name}`, kind: 'Member', badge, name }] : [];
  });
}

/** 'a podcast about …' is written for mid-sentence use; the tile starts a line with it. */
function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function podcastTiles(member: TeamMember): RecognitionTile[] {
  const p = member.podcast;
  if (!p?.badge) return [];
  return [
    {
      key: `podcast:${p.name}`,
      kind: p.role,
      badge: p.badge,
      name: p.name,
      detail: sentenceCase(p.description),
      href: p.url,
    },
  ];
}

export function recognitionTiles(member: TeamMember): RecognitionTile[] {
  return [
    ...member.credentials.flatMap(credentialTiles),
    ...roleTiles(member),
    ...membershipTiles(member),
    ...podcastTiles(member),
  ];
}
