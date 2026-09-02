import { describe, expect, it } from 'vitest';
import { BENEFICIARY_PRACTICES, lensConfig, TRUSTEE_ANCHOR_SLUG } from '@/config/lens';
import { practiceHub, practicePages } from '@/config/practice-areas';
import { SITUATIONS } from '@/lib/intake/contract';
import { getArticles } from '@/lib/library/articles';
import { LIBRARY_CATEGORIES } from '@/types/content';
import { articleLensWeights } from './article-weights';
import {
  navigationWeight,
  normalizePath,
  pathWeight,
  signalForEvent,
  signalForPath,
} from './signals';

const beneficiaryPractices: readonly string[] = BENEFICIARY_PRACTICES;

/** The nudge an event carries, or null when it says nothing or sets the score instead. */
function weightOf(eventKey: string): number | null {
  const effect = signalForEvent(eventKey);
  return effect && 'weight' in effect ? effect.weight : null;
}

describe('signalForPath', () => {
  it('weights every practice page: trustees +2, the seven beneficiary pages -2, the rest 0', () => {
    for (const area of practicePages) {
      const expected =
        area.slug === 'for-trustees' ? 2 : beneficiaryPractices.includes(area.slug) ? -2 : 0;
      expect(pathWeight(`/${area.slug}/`), area.slug).toBe(expected);
    }
    expect(pathWeight(`/${practiceHub.slug}/`)).toBe(0);
    expect(beneficiaryPractices).toHaveLength(7);
  });

  it('counts landing at full weight and navigation at half, toward zero, never below ±1', () => {
    expect(signalForPath('/for-trustees/', true)).toEqual({ key: '/for-trustees/', weight: 2 });
    expect(signalForPath('/for-trustees/', false)).toEqual({ key: '/for-trustees/', weight: 1 });
    expect(signalForPath('/trust-contests/', true)).toEqual({
      key: '/trust-contests/',
      weight: -2,
    });
    expect(signalForPath('/trust-contests/', false)).toEqual({
      key: '/trust-contests/',
      weight: -1,
    });
    expect(navigationWeight(3)).toBe(1);
    expect(navigationWeight(-3)).toBe(-1);
    expect(navigationWeight(1)).toBe(1);
    expect(navigationWeight(-1)).toBe(-1);
    expect(navigationWeight(4)).toBe(2);
  });

  it('says nothing on neutral ground', () => {
    const neutral = [
      '/',
      '/about/',
      '/library/',
      '/complex-estates/',
      '/trust-litigation/',
      '/business-disputes/',
      '/how-long-do-i-have/',
      '/request-a-consult/',
      '/nowhere/',
    ];
    for (const path of neutral) expect(signalForPath(path, true), path).toBeNull();
  });

  it('normalizes slashes, queries, and hashes into the key', () => {
    expect(normalizePath('/for-trustees')).toBe('/for-trustees/');
    expect(normalizePath('/for-trustees/?a=1#b')).toBe('/for-trustees/');
    expect(normalizePath('')).toBe('/');
    expect(signalForPath('/for-trustees?x=1', true)?.key).toBe('/for-trustees/');
  });

  it('weights every article by its category through the export-time map', () => {
    const weights = articleLensWeights();
    for (const category of LIBRARY_CATEGORIES) {
      expect(typeof lensConfig.categoryWeights[category], category).toBe('number');
    }
    for (const article of getArticles()) {
      const expected = lensConfig.categoryWeights[article.category];
      expect(pathWeight(`/library/${article.slug}/`, weights), article.slug).toBe(expected);
    }
    expect(pathWeight(`/library/${TRUSTEE_ANCHOR_SLUG}/`, weights)).toBe(2);
    expect(pathWeight('/library/how-to-contest-a-trust-in-california/', weights)).toBe(-2);
    expect(
      pathWeight('/library/how-long-do-i-have-to-contest-a-trust-or-will-in-california/', weights),
    ).toBe(0);
    expect(pathWeight('/library/what-is-ai/', weights)).toBe(0);
    expect(pathWeight('/library/not-an-article/', weights)).toBe(0);
    expect(Object.values(weights).every((w) => w !== 0)).toBe(true);
  });
});

describe('signalForEvent', () => {
  it('scores the homepage problem cards', () => {
    expect(signalForEvent('card:for-trustees')).toEqual({ key: 'card:for-trustees', weight: 2 });
    expect(weightOf('card:trust-contests')).toBe(-2);
    expect(weightOf('card:trust-litigation')).toBe(-2);
  });

  it('scores the library chips lightly and ignores the neutral ones', () => {
    expect(weightOf('chip:for-trustees')).toBe(1);
    expect(weightOf('chip:trust-contests')).toBe(-1);
    expect(weightOf('chip:undue-influence-and-capacity')).toBe(-1);
    expect(weightOf('chip:elder-financial-abuse')).toBe(-1);
    expect(signalForEvent('chip:deadlines')).toBeNull();
    expect(signalForEvent('chip:complex-estates')).toBeNull();
    expect(signalForEvent('chip:technology-and-the-law')).toBeNull();
  });

  it('scores the relationship answer and the intake situations', () => {
    expect(weightOf('wizard:relationship:trustee-or-executor')).toBe(3);
    expect(weightOf('wizard:relationship:child')).toBe(-2);
    expect(weightOf('wizard:relationship:beneficiary')).toBe(-2);
    expect(weightOf('intake:situation:for-trustees')).toBe(3);
    expect(weightOf('intake:situation:will-contests')).toBe(-2);
    expect(signalForEvent('intake:situation:complex-estates')).toBeNull();
    expect(signalForEvent('intake:situation:business-disputes')).toBeNull();
    expect(signalForEvent('intake:situation:other')).toBeNull();
  });

  it('sets the score outright for the escape hatch', () => {
    expect(signalForEvent('switch:trustee')).toEqual({ key: 'switch:trustee', set: 3 });
    expect(signalForEvent('switch:beneficiary')).toEqual({ key: 'switch:beneficiary', set: -3 });
    expect(signalForEvent('switch:nowhere')).toBeNull();
  });

  it('drops keys no rule knows', () => {
    expect(signalForEvent('unknown:thing')).toBeNull();
    expect(signalForEvent('')).toBeNull();
  });
});

describe('lens config sanity', () => {
  it('names real practice slugs and intake situations', () => {
    const slugs = practicePages.map((a) => a.slug);
    for (const slug of BENEFICIARY_PRACTICES) expect(slugs).toContain(slug);
    for (const slug of lensConfig.cardsFirst.trustee ?? []) expect(slugs).toContain(slug);
    const situationKeys: readonly string[] = SITUATIONS.map((s) => s.key);
    for (const key of lensConfig.intakePreselect.trustee ?? []) {
      expect(situationKeys).toContain(key);
    }
    for (const slug of BENEFICIARY_PRACTICES) expect(situationKeys).toContain(slug);
  });
});
