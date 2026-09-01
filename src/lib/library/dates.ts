import { formatDate } from '@/lib/format-date';

/** "2026-09-01" → "Sep 1, 2026" for card meta rows; long form stays in format-date.ts. */
export function formatShortDate(iso: string): string {
  const long = formatDate(iso);
  return long.replace(/^([A-Z][a-z]{2})[a-z]*/, '$1');
}

/** Newest first by `date`, ties by `updated`. */
export function byNewest<T extends { date: string; updated: string }>(a: T, b: T): number {
  return b.date.localeCompare(a.date) || b.updated.localeCompare(a.updated);
}
