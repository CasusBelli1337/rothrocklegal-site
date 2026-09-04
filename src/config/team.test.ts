import { describe, expect, it } from 'vitest';
import { framings, isFramed, team } from './team';
import { LENSES } from '@/lib/lens/types';

/** Every framing of a member's bio, flattened to one string. */
function bioText(member: (typeof team)[number]): string {
  const framed = framings(member.bio);
  return LENSES.map((lens) => framed[lens].join(' ')).join(' ');
}

describe('team config (Arthur, 2026-09-04)', () => {
  it('names the four lawyers with no nicknames', () => {
    expect(team.map((m) => m.name)).toEqual([
      'Arthur E. Rothrock',
      'Jonathan Joannides',
      'Gerry Lin',
      'Max Discher',
    ]);
    for (const member of team) expect(JSON.stringify(member)).not.toMatch(/\bJJ\b/);
  });

  it('carries no graduation or bar-admission years', () => {
    for (const member of team) {
      for (const education of member.education) expect(education).not.toHaveProperty('year');
      expect(member.barStatus ?? '').not.toMatch(/\b(19|20)\d{2}\b/);
      expect(bioText(member)).not.toMatch(
        /(J\.D\.|admitted|State Bar of California)[^.]*\b(19|20)\d{2}\b/,
      );
    }
  });

  it('calls Arthur a litigator and frames his opening and hero line per lens', () => {
    const arthur = team[0];
    expect(isFramed(arthur.bio)).toBe(true);
    expect(isFramed(arthur.heroLine ?? '')).toBe(true);
    const framed = framings(arthur.bio);
    for (const lens of LENSES) {
      expect(framed[lens][0]).toMatch(/^Arthur Rothrock is a litigator\./);
      expect(framed[lens].slice(1)).toEqual(framed.neutral.slice(1));
    }
    expect(framed.beneficiary[0]).toMatch(/cut out/);
    expect(framed.trustee[0]).toMatch(/defending trustees/);
    expect(bioText(arthur)).not.toMatch(/trial lawyer|trial attorney/i);
  });

  it('says who the people are, not how the firm divides its work', () => {
    for (const member of team) {
      const text = bioText(member);
      expect(text).not.toContain('—');
      expect(text).not.toMatch(/\bexperts?\b|\bspecialists?\b/i);
      expect(text).not.toMatch(
        /takes the depositions|argues the hearings|cite-checks|sets the strategy/i,
      );
      expect(text).not.toMatch(/which he still runs|still runs/i);
    }
    expect(bioText(team[1])).toMatch(/founded Digital Frontier Law/);
    for (const slug of ['gerry-lin', 'max-discher']) {
      const member = team.find((m) => m.slug === slug);
      expect(bioText(member!)).toMatch(
        /Santa Clara University School of Law, where he and Arthur were classmates/,
      );
    }
  });
});
