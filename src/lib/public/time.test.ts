import { describe, expect, it } from 'vitest';
import { dayKey, durationMinutes, formatDayLong, formatTime, formatWhen, sameZone, zoneLabel } from './time';

const LA = 'America/Los_Angeles';
/** 2:00 PM Pacific on Wednesday, September 9, 2026 (PDT, UTC-7). */
const START = '2026-09-09T21:00:00.000Z';

describe('time formatting in the firm zone', () => {
  it('formats the clock, the day, and both together', () => {
    expect(formatTime(START, LA)).toBe('2:00 PM');
    expect(formatDayLong(START, LA)).toBe('Wednesday, September 9');
    expect(formatWhen(START, LA)).toBe('Wednesday, September 9 at 2:00 PM');
  });

  it('keys a slot by its calendar day in the zone, not in UTC', () => {
    // 11:30 PM Pacific is already the next day in UTC.
    expect(dayKey('2026-09-10T06:30:00.000Z', LA)).toBe('2026-09-09');
    expect(dayKey(START, LA)).toBe('2026-09-09');
  });

  it('measures a slot in minutes', () => {
    expect(durationMinutes(START, '2026-09-09T21:45:00.000Z')).toBe(45);
  });

  it('names a zone in words and compares zones by clock', () => {
    expect(zoneLabel(LA, new Date(START))).toBe('Pacific Time');
    expect(sameZone(LA, 'US/Pacific', new Date(START))).toBe(true);
    expect(sameZone(LA, 'America/New_York', new Date(START))).toBe(false);
    expect(zoneLabel('Not/AZone')).toBe('Not/AZone');
  });
});
