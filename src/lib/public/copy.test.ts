import { describe, expect, it } from 'vitest';
import * as copy from './copy';

/** Every string in the copy module, functions called with sample values. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') return strings((value as (...args: unknown[]) => unknown)(3, 7));
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const BANNED_WORDS = [
  'delve', 'explore', 'navigate', 'unlock', 'leverage', 'elevate', 'empower', 'transform',
  'foster', 'harness', 'landscape', 'ecosystem', 'synergy', 'paradigm', 'journey', 'realm',
  'furthermore', 'moreover', 'additionally', 'robust', 'seamless', 'actionable', 'expert',
  'specialist', 'client',
];

describe('public page copy', () => {
  const lines = strings(copy);

  it('has copy to check', () => {
    expect(lines.length).toBeGreaterThan(60);
  });

  it('uses no em dashes', () => {
    expect(lines.filter((line) => line.includes('\u2014'))).toEqual([]);
  });

  it('uses none of the voice guide blacklist and never calls the person a client', () => {
    const hits = lines.filter((line) =>
      BANNED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(line)),
    );
    expect(hits).toEqual([]);
  });

  it('never promises an outcome or a reply time', () => {
    expect(lines.filter((line) => /\b(guarantee|we will win|within one business day)\b/i.test(line))).toEqual([]);
  });

  it('never carries a street address', () => {
    expect(lines.filter((line) => /\b\d{2,5}\s+\w+\s+(St|Street|Ave|Avenue|Blvd|Road|Rd)\b/i.test(line))).toEqual([]);
  });

  it('spells out the electronic-signature consent', () => {
    const consent = copy.SIGN_COPY.signature.consent;
    expect(consent).toMatch(/electronically/);
    expect(consent).toMatch(/binding/);
    expect(consent).toMatch(/paper copy/);
  });

  it('tells a person with a dead link whom to email', () => {
    expect(copy.SIGN_COPY.invalid.body).toContain(copy.FIRM_EMAIL);
    expect(copy.SCHEDULE_COPY.invalid.body).toContain(copy.FIRM_EMAIL);
    expect(copy.SIGN_COPY.invalid.title).toBe('This signing link is not valid or has expired.');
  });

  it('says a consultation does not make the firm their lawyers', () => {
    expect(copy.SCHEDULE_COPY.booked.notLawyersYet).toMatch(/does not make us your lawyers/);
  });

  it('formats the progress and thank-you lines', () => {
    expect(copy.SIGN_COPY.read.progress(2, 7)).toBe('You have reached page 2 of 7.');
    expect(copy.SIGN_COPY.done.received('4:12 PM')).toBe('We received your signature at 4:12 PM.');
    expect(copy.SCHEDULE_COPY.intro(45)).toContain('about 45 minutes');
    expect(copy.SCHEDULE_COPY.booked.title('Wednesday, September 9')).toBe('See you on Wednesday, September 9.');
  });
});
