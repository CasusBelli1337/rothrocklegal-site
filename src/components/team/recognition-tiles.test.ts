import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { team } from '@/config/team';
import { arthurRothrock } from '@/config/team/arthur-rothrock';
import { gerryLin } from '@/config/team/gerry-lin';
import { recognitionTiles } from './recognition-tiles';

describe('recognitionTiles', () => {
  it("lays Arthur's record out as one tile per badge, in the record's order", () => {
    const tiles = recognitionTiles(arthurRothrock);
    expect(tiles.map((t) => [t.kind, t.name, t.detail])).toEqual([
      ['Award', 'Super Lawyers® Rising Stars', 'Northern California'],
      ['Award', 'Best Lawyers: Ones to Watch® in America', 'Litigation – Trusts and Estates'],
      ['Award', 'Best Lawyers: Ones to Watch® in America', 'Commercial Litigation'],
      [
        'Vice Chair',
        'American Bar Association Artificial Intelligence and Robotics National Institute',
        undefined,
      ],
      ['Member', 'Honorable William A. Ingram American Inn of Court', undefined],
      [
        'Host',
        "The Litigator's Path",
        'A podcast about building and running a litigation practice',
      ],
    ]);
    expect(new Set(tiles.map((t) => t.key)).size).toBe(tiles.length);
  });

  it('prints years and issuer on award tiles and years alone on an office', () => {
    const tiles = recognitionTiles(arthurRothrock);
    expect(tiles[0].meta).toBe('2020–2026 · Super Lawyers (Thomson Reuters)');
    expect(tiles[3].meta).toBe('2026–present');
    expect(tiles[4].meta).toBeUndefined();
  });

  it('links only the podcast tile, to the podcast URL', () => {
    const tiles = recognitionTiles(arthurRothrock);
    expect(tiles.filter((t) => t.href).map((t) => t.href)).toEqual([arthurRothrock.podcast?.url]);
  });

  it('gives every tile on the team art that exists under public/', () => {
    const tiles = team.flatMap(recognitionTiles);
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      const file = path.join(process.cwd(), 'public', tile.badge.src);
      expect(existsSync(file), `${tile.name}: ${tile.badge.src}`).toBe(true);
    }
  });

  it('is empty for a member with no badge art', () => {
    expect(recognitionTiles(gerryLin)).toEqual([]);
  });

  it('fails loudly when a membership badge is keyed to a membership the member does not list', () => {
    const badge =
      arthurRothrock.membershipBadges?.['Honorable William A. Ingram American Inn of Court'];
    if (!badge) throw new Error('fixture: expected the Inn of Court badge');
    const broken = { ...arthurRothrock, membershipBadges: { 'Some Other Club': badge } };
    expect(() => recognitionTiles(broken)).toThrow(/Some Other Club/);
  });
});
