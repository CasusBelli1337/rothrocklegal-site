import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  formatLongDate,
  formatShortDate,
  isCourtDay,
  isCourtHoliday,
  parseISODate,
  rollToCourtDay,
  todayISO,
  toISODate,
  weekday,
} from './dates';

describe('parseISODate', () => {
  it('parses real calendar dates only', () => {
    expect(parseISODate('2026-09-01')).toEqual({
      year: 2026,
      month: 9,
      day: 1,
    });
    expect(parseISODate('2028-02-29')).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    expect(parseISODate('2027-02-29')).toBeNull();
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('2026-00-10')).toBeNull();
  });

  it('rejects other formats and empties', () => {
    expect(parseISODate('9/1/2026')).toBeNull();
    expect(parseISODate('2026-9-1')).toBeNull();
    expect(parseISODate('2026-09-01T00:00:00Z')).toBeNull();
    expect(parseISODate('')).toBeNull();
    expect(parseISODate(undefined)).toBeNull();
    expect(parseISODate(null)).toBeNull();
  });

  it('round-trips through toISODate', () => {
    expect(toISODate({ year: 2026, month: 3, day: 7 })).toBe('2026-03-07');
  });
});

describe('addDays', () => {
  it('counts CCP § 12 style: excludes the first day, includes the last', () => {
    expect(addDays('2026-03-01', 120)).toBe('2026-06-29');
    expect(addDays('2026-05-24', 120)).toBe('2026-09-21');
    expect(addDays('2026-08-22', 60)).toBe('2026-10-21');
  });

  it('crosses year ends and handles leap days', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    expect(addDays('2028-02-29', 365)).toBe('2029-02-28');
    expect(addDays('2026-09-01', -130)).toBe('2026-04-24');
  });

  it('is immune to daylight-saving transitions', () => {
    // US DST starts 2026-03-08 and ends 2026-11-01.
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-10-31', 2)).toBe('2026-11-02');
  });

  it('throws on invalid input rather than guessing', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError);
    expect(() => addDays('2026-09-01', 1.5)).toThrow(RangeError);
  });
});

describe('addMonths / addYears', () => {
  it('clamps to the last day of a shorter month (the earlier, safer date)', () => {
    expect(addMonths('2027-01-31', 1)).toBe('2027-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-10-31', 4)).toBe('2027-02-28');
    expect(addMonths('2026-05-31', 4)).toBe('2026-09-30');
  });

  it('keeps the day when the target month is long enough', () => {
    expect(addMonths('2026-11-15', 4)).toBe('2027-03-15');
    expect(addMonths('2026-01-15', -2)).toBe('2025-11-15');
    expect(addMonths('2026-12-05', 1)).toBe('2027-01-05');
  });

  it('handles leap-day anniversaries', () => {
    expect(addYears('2028-02-29', 1)).toBe('2029-02-28');
    expect(addYears('2024-02-29', 4)).toBe('2028-02-29');
    expect(addYears('2026-03-01', 1)).toBe('2027-03-01');
    expect(addYears('2026-09-01', 4)).toBe('2030-09-01');
  });
});

describe('weekday / daysBetween', () => {
  it('knows the day of the week', () => {
    expect(weekday('2026-09-01')).toBe(2); // Tuesday
    expect(weekday('2026-07-04')).toBe(6); // Saturday
    expect(weekday('2026-06-28')).toBe(0); // Sunday
  });

  it('returns signed day counts', () => {
    expect(daysBetween('2026-09-01', '2026-10-21')).toBe(50);
    expect(daysBetween('2026-09-01', '2026-08-24')).toBe(-8);
    expect(daysBetween('2026-09-01', '2026-09-01')).toBe(0);
    expect(daysBetween('2027-12-31', '2028-03-01')).toBe(61);
  });
});

describe('rollToCourtDay (CCP § 12a)', () => {
  it('leaves a court day alone', () => {
    expect(rollToCourtDay('2026-09-21')).toEqual({
      date: '2026-09-21',
      rolled: false,
    });
  });

  it('rolls Saturday and Sunday to Monday', () => {
    expect(rollToCourtDay('2026-06-27')).toEqual({
      date: '2026-06-29',
      rolled: true,
    });
    expect(rollToCourtDay('2026-06-28')).toEqual({
      date: '2026-06-29',
      rolled: true,
    });
  });

  it('rolls over court holidays, including chains of them', () => {
    // Observed Independence Day (Friday) → Monday.
    expect(rollToCourtDay('2026-07-03')).toEqual({
      date: '2026-07-06',
      rolled: true,
    });
    // Thanksgiving → day after (holiday) → weekend → Monday.
    expect(rollToCourtDay('2026-11-26')).toEqual({
      date: '2026-11-30',
      rolled: true,
    });
    // Christmas 2027 observed on Friday Dec 24 → Monday Dec 27.
    expect(rollToCourtDay('2027-12-24')).toEqual({
      date: '2027-12-27',
      rolled: true,
    });
    // Sunday → Labor Day 2030 (generated) → Tuesday.
    expect(rollToCourtDay('2030-09-01')).toEqual({
      date: '2030-09-03',
      rolled: true,
    });
  });

  it('exposes the holiday and court-day checks', () => {
    expect(isCourtHoliday('2026-11-27')).toBe(true);
    expect(isCourtHoliday('2026-11-25')).toBe(false);
    expect(isCourtDay('2026-11-28')).toBe(false);
    expect(isCourtDay('2026-11-30')).toBe(true);
  });
});

describe('formatting and today', () => {
  it('formats in English with no time-zone drift', () => {
    expect(formatLongDate('2026-06-29')).toBe('Monday, June 29, 2026');
    expect(formatShortDate('2026-01-01')).toBe('January 1, 2026');
  });

  it('uses the local calendar date for today', () => {
    expect(todayISO(new Date(2026, 0, 31, 23, 30))).toBe('2026-01-31');
    expect(todayISO(new Date(2026, 11, 31, 0, 5))).toBe('2026-12-31');
  });
});
