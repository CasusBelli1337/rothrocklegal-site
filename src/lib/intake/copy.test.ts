import { describe, expect, it } from 'vitest';
import * as copy from './copy';

/** Every string in the copy module, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('intake copy hygiene', () => {
  const lines = strings(copy);

  it('has copy to check', () => {
    expect(lines.length).toBeGreaterThan(40);
  });

  it('uses no em dashes', () => {
    expect(lines.filter((line) => line.includes('—'))).toEqual([]);
  });

  it('never doubles a sentence or its full stop', () => {
    // Regression: "We strive to reply We strive to respond within one business day.." on the consult page.
    const doubled = lines.filter(
      (line) => /\.\.(?!\.)/.test(line) || /\b(We \w+ to)\b.*\b\1\b/.test(line),
    );
    expect(doubled).toEqual([]);
  });

  it('starts the "We email you" step with the reply promise', () => {
    const step = copy.AFTER_YOU_SEND.find((s) => s.title === 'We email you.');
    expect(step?.body.startsWith(copy.REPLY_PROMISE)).toBe(true);
    expect(step?.body).not.toContain('We strive to reply We strive');
  });
});
