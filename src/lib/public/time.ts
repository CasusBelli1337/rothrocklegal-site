/**
 * Dates on the two public pages. Appointment times are shown in the firm's
 * zone (the invite carries it); the moment a person signed is shown on their
 * own clock. Everything goes through Intl so the browser does the zone math.
 */

const LOCALE = 'en-US';

export function formatTime(iso: string, zone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: zone,
  }).format(new Date(iso));
}

/** "Tuesday, September 9". */
export function formatDayLong(iso: string, zone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: zone,
  }).format(new Date(iso));
}

/** "Tuesday, September 9 at 2:00 PM". */
export function formatWhen(iso: string, zone?: string): string {
  return `${formatDayLong(iso, zone)} at ${formatTime(iso, zone)}`;
}

/** "2026-09-09" in the given zone, for grouping slots by day. */
export function dayKey(iso: string, zone?: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: zone,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
}

/** The visitor's own zone, or null when the browser will not say. */
export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** "Pacific Time" for America/Los_Angeles; the IANA name when the browser has no words for it. */
export function zoneLabel(zone: string, at: Date = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat(LOCALE, { timeZone: zone, timeZoneName: 'longGeneric' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? zone;
  } catch {
    return zone;
  }
}

/** True when two IANA names are the same clock (the browser normalizes aliases). */
export function sameZone(a: string, b: string, at: Date = new Date()): boolean {
  if (a === b) return true;
  try {
    const offset = (zone: string) =>
      new Intl.DateTimeFormat(LOCALE, { timeZone: zone, timeZoneName: 'longOffset' })
        .formatToParts(at)
        .find((p) => p.type === 'timeZoneName')?.value;
    return offset(a) === offset(b);
  } catch {
    return false;
  }
}
