/**
 * California judicial holidays. A deadline that lands on one of these (or a
 * weekend) rolls to the next court day under Code of Civil Procedure § 12a.
 *
 * Source of truth for 2026–2027: the published court holiday schedule at
 * https://santaclara.courts.ca.gov/general-information/court-holidays
 * (fetched 2026-09-01), cross-checked against the statewide list at
 * https://www.courts.ca.gov/holidays.htm (2026). Both match the statutory
 * list: Government Code § 6700 holidays minus the ones Code of Civil
 * Procedure § 135 excludes (Lunar New Year, Diwali, Genocide Remembrance
 * Day, Admission Day, Columbus Day), plus the day after Thanksgiving.
 *
 * For years outside the verified table, `generateCourtHolidays` applies the
 * same statutory rules. The test suite proves it reproduces the verified
 * years exactly, so a deadline years out (elder abuse: four years) still
 * rolls correctly. Re-verify against the court's schedule each year.
 */

export const COURT_HOLIDAY_SOURCE =
  'Santa Clara County Superior Court holiday schedule, fetched 2026-09-01';

export const VERIFIED_COURT_HOLIDAYS: Readonly<Record<string, readonly string[]>> = {
  '2026': [
    '2026-01-01', // New Year's Day
    '2026-01-19', // Martin Luther King Jr. Day
    '2026-02-12', // Lincoln's Birthday
    '2026-02-16', // Presidents' Day
    '2026-03-31', // Farmworkers Day (Cesar Chavez Day)
    '2026-05-25', // Memorial Day
    '2026-06-19', // Juneteenth
    '2026-07-03', // Independence Day (July 4 is a Saturday)
    '2026-09-07', // Labor Day
    '2026-09-25', // Native American Day
    '2026-11-11', // Veterans Day
    '2026-11-26', // Thanksgiving Day
    '2026-11-27', // Day after Thanksgiving
    '2026-12-25', // Christmas Day
  ],
  '2027': [
    '2027-01-01', // New Year's Day
    '2027-01-18', // Martin Luther King Jr. Day
    '2027-02-12', // Lincoln's Birthday
    '2027-02-15', // Presidents' Day
    '2027-03-31', // Farmworkers Day (Cesar Chavez Day)
    '2027-05-31', // Memorial Day
    '2027-06-18', // Juneteenth (June 19 is a Saturday)
    '2027-07-05', // Independence Day (July 4 is a Sunday)
    '2027-09-06', // Labor Day
    '2027-09-24', // Native American Day
    '2027-11-11', // Veterans Day
    '2027-11-25', // Thanksgiving Day
    '2027-11-26', // Day after Thanksgiving
    '2027-12-24', // Christmas Day (December 25 is a Saturday)
  ],
};

const SATURDAY = 6;
const SUNDAY = 0;

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** The nth (1-based) given weekday of a month, e.g. third Monday of January. */
function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = weekdayOf(year, month, 1);
  const day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  return iso(year, month, day);
}

function lastWeekday(year: number, month: number, weekday: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = weekdayOf(year, month, lastDay);
  return iso(year, month, lastDay - ((last - weekday + 7) % 7));
}

/**
 * A fixed-date holiday on a Saturday is observed the Friday before; on a
 * Sunday, the Monday after (the Judicial Council's designation under CCP
 * § 135, matching the published 2026 and 2027 schedules).
 */
function observed(year: number, month: number, day: number): string {
  const weekday = weekdayOf(year, month, day);
  const shift = weekday === SATURDAY ? -1 : weekday === SUNDAY ? 1 : 0;
  const date = new Date(Date.UTC(year, month - 1, day + shift));
  return iso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Judicial holidays for any year from the Gov. Code § 6700 / CCP § 135 rules. */
export function generateCourtHolidays(year: number): string[] {
  const thanksgiving = nthWeekday(year, 11, 4, 4);
  const dayAfter = new Date(Date.UTC(year, 10, Number(thanksgiving.slice(-2)) + 1));
  const days = [
    observed(year, 1, 1),
    nthWeekday(year, 1, 1, 3),
    observed(year, 2, 12),
    nthWeekday(year, 2, 1, 3),
    observed(year, 3, 31),
    lastWeekday(year, 5, 1),
    observed(year, 6, 19),
    observed(year, 7, 4),
    nthWeekday(year, 9, 1, 1),
    nthWeekday(year, 9, 5, 4),
    observed(year, 11, 11),
    thanksgiving,
    iso(year, 11, dayAfter.getUTCDate()),
    observed(year, 12, 25),
  ];
  // New Year's Day of the following year, when it is observed on Dec 31.
  if (weekdayOf(year + 1, 1, 1) === SATURDAY) days.push(iso(year, 12, 31));
  return days.filter((d) => d.startsWith(`${year}-`)).sort();
}

export function courtHolidaysForYear(year: number): readonly string[] {
  return VERIFIED_COURT_HOLIDAYS[String(year)] ?? generateCourtHolidays(year);
}
