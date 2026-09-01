import { describe, expect, it } from 'vitest';
import { weekday } from './dates';
import { courtHolidaysForYear, generateCourtHolidays, VERIFIED_COURT_HOLIDAYS } from './holidays';

describe('verified court holiday table', () => {
  it('has 14 holidays in each verified year, all on weekdays, sorted', () => {
    for (const year of ['2026', '2027']) {
      const list = VERIFIED_COURT_HOLIDAYS[year];
      expect(list).toHaveLength(14);
      expect([...list].sort()).toEqual([...list]);
      for (const day of list) {
        expect(day.startsWith(`${year}-`)).toBe(true);
        expect([0, 6]).not.toContain(weekday(day));
      }
    }
  });

  it('is what courtHolidaysForYear returns for verified years', () => {
    expect(courtHolidaysForYear(2026)).toBe(VERIFIED_COURT_HOLIDAYS['2026']);
    expect(courtHolidaysForYear(2027)).toBe(VERIFIED_COURT_HOLIDAYS['2027']);
  });
});

describe('generateCourtHolidays', () => {
  it('reproduces the published 2026 schedule exactly', () => {
    expect(generateCourtHolidays(2026)).toEqual([...VERIFIED_COURT_HOLIDAYS['2026']]);
  });

  it('reproduces the published 2027 schedule, plus Dec 31 for the Saturday New Year 2028', () => {
    // Jan 1, 2028 is a Saturday. The court's published 2027 list (fetched
    // 2026-09-01) did not yet show its Friday observance; see RULES.md.
    expect(generateCourtHolidays(2027)).toEqual(
      [...VERIFIED_COURT_HOLIDAYS['2027'], '2027-12-31'].sort(),
    );
  });

  it('applies the Saturday → Friday / Sunday → Monday observance in other years', () => {
    const list = generateCourtHolidays(2028);
    expect(list).toContain('2028-02-11'); // Lincoln's Birthday, Feb 12 is a Saturday
    expect(list).toContain('2028-11-10'); // Veterans Day, Nov 11 is a Saturday
    expect(list).toContain('2028-11-23'); // Thanksgiving
    expect(list).toContain('2028-11-24'); // Day after Thanksgiving
    expect(list).toContain('2028-12-25'); // Christmas, a Monday
    expect(list).not.toContain('2028-01-01'); // Saturday; observed Dec 31, 2027
    expect(generateCourtHolidays(2034)).toContain('2034-01-02'); // Jan 1, 2034 is a Sunday
  });

  it('never puts a holiday on a weekend and stays in its own year', () => {
    for (let year = 2026; year <= 2040; year += 1) {
      const list = generateCourtHolidays(year);
      expect(list.length).toBeGreaterThanOrEqual(13); // 13 when Jan 1 is a Saturday
      expect(list.length).toBeLessThanOrEqual(15);
      for (const day of list) {
        expect(day.startsWith(`${year}-`)).toBe(true);
        expect([0, 6]).not.toContain(weekday(day));
      }
    }
  });

  it('is used for years outside the verified table', () => {
    expect(courtHolidaysForYear(2030)).toEqual(generateCourtHolidays(2030));
    expect(courtHolidaysForYear(2030)).toContain('2030-09-02'); // Labor Day
  });
});
