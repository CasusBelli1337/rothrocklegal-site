/**
 * Calendar-date math for deadline computation. Dates are ISO strings
 * (YYYY-MM-DD) treated as plain calendar dates; all arithmetic runs in UTC so
 * the visitor's time zone and daylight-saving changes cannot shift a day.
 *
 * Counting follows Code of Civil Procedure § 12: exclude the first day,
 * include the last. "120 days from March 1" is June 29 (March 1 + 120 days).
 * Months and years are calendar months and years; when the target month is
 * shorter (Jan 31 + 1 month, Feb 29 + 1 year) the day clamps to the last day
 * of that month, which is the earlier and therefore safer date.
 */
import { courtHolidaysForYear } from './holidays';

export interface CalendarDate {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;
const SATURDAY = 6;
const SUNDAY = 0;

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Strict parse: real calendar dates only ("2026-02-30" is null). */
export function parseISODate(value: string | undefined | null): CalendarDate | null {
  if (!value) return null;
  const match = ISO_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function isValidISODate(value: string | undefined | null): boolean {
  return parseISODate(value) !== null;
}

export function toISODate(date: CalendarDate): string {
  const mm = String(date.month).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  return `${date.year}-${mm}-${dd}`;
}

function requireDate(value: string): CalendarDate {
  const parsed = parseISODate(value);
  if (!parsed) throw new RangeError(`Invalid ISO calendar date: "${value}"`);
  return parsed;
}

function toEpochDays(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY;
}

function fromEpochDays(epochDays: number): CalendarDate {
  const d = new Date(epochDays * MS_PER_DAY);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function addDays(isoDate: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError(`Days must be an integer, got ${days}`);
  return toISODate(fromEpochDays(toEpochDays(requireDate(isoDate)) + days));
}

/** Calendar months, clamping to the last day of a shorter target month. */
export function addMonths(isoDate: string, months: number): string {
  if (!Number.isInteger(months)) throw new RangeError(`Months must be an integer, got ${months}`);
  const date = requireDate(isoDate);
  const monthIndex = date.month - 1 + months;
  const year = date.year + Math.floor(monthIndex / 12);
  const month = (((monthIndex % 12) + 12) % 12) + 1;
  const day = Math.min(date.day, daysInMonth(year, month));
  return toISODate({ year, month, day });
}

export function addYears(isoDate: string, years: number): string {
  return addMonths(isoDate, years * 12);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(isoDate: string): number {
  const d = requireDate(isoDate);
  return new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();
}

/** Signed count of calendar days from `fromIso` to `toIso`. */
export function daysBetween(fromIso: string, toIso: string): number {
  return toEpochDays(requireDate(toIso)) - toEpochDays(requireDate(fromIso));
}

export function isWeekend(isoDate: string): boolean {
  const day = weekday(isoDate);
  return day === SATURDAY || day === SUNDAY;
}

export function isCourtHoliday(isoDate: string): boolean {
  const { year } = requireDate(isoDate);
  return courtHolidaysForYear(year).includes(isoDate);
}

export function isCourtDay(isoDate: string): boolean {
  return !isWeekend(isoDate) && !isCourtHoliday(isoDate);
}

export interface RolledDate {
  date: string;
  rolled: boolean;
}

/** CCP § 12a: a last day on a weekend or court holiday extends to the next court day. */
export function rollToCourtDay(isoDate: string): RolledDate {
  let date = isoDate;
  let rolled = false;
  while (!isCourtDay(date)) {
    date = addDays(date, 1);
    rolled = true;
  }
  return { date, rolled };
}

function utcDate(isoDate: string): Date {
  const d = requireDate(isoDate);
  return new Date(Date.UTC(d.year, d.month - 1, d.day));
}

/** "Monday, June 29, 2026" */
export function formatLongDate(isoDate: string): string {
  return utcDate(isoDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "June 29, 2026" */
export function formatShortDate(isoDate: string): string {
  return utcDate(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Today as the visitor's LOCAL calendar date (never `toISOString`, which is UTC). */
export function todayISO(now: Date = new Date()): string {
  return toISODate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}
