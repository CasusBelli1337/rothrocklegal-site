import { describe, expect, it } from 'vitest';
import * as copy from './copy';
import { STEP_ORDER } from './state';

/** Every string in the copy module, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

/** Arthur's Voice guide: the words and constructions that read as machine-written. */
const BANNED_WORDS = [
  'delve',
  'explore',
  'navigate',
  'unlock',
  'leverage',
  'elevate',
  'empower',
  'transform',
  'foster',
  'harness',
  'landscape',
  'ecosystem',
  'synergy',
  'paradigm',
  'game-changer',
  'journey',
  'realm',
  'tapestry',
  'beacon',
  'furthermore',
  'moreover',
  'additionally',
  'robust',
  'seamless',
  'actionable',
  'expert',
  'specialist',
];
const BANNED_PHRASES = [
  /it'?s not just about/i,
  /in today'?s/i,
  /it'?s important to note/i,
  /the key takeaway/i,
  /imagine a world/i,
  /the future is bright/i,
  /that'?s a great question/i,
  /thrilled to/i,
  /i'?m humbled/i,
  /we can'?t wait/i,
];

describe('intake copy hygiene', () => {
  const lines = strings(copy);

  it('has copy to check', () => {
    expect(lines.length).toBeGreaterThan(80);
  });

  it('uses no em dashes', () => {
    expect(lines.filter((line) => line.includes('—'))).toEqual([]);
  });

  it('uses none of the voice guide blacklist', () => {
    const wordHits = lines.filter((line) =>
      BANNED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(line)),
    );
    const phraseHits = lines.filter((line) => BANNED_PHRASES.some((re) => re.test(line)));
    expect(wordHits).toEqual([]);
    expect(phraseHits).toEqual([]);
  });

  it('never promises an outcome', () => {
    expect(lines.filter((line) => /\b(guarantee|we will win|you will win)\b/i.test(line))).toEqual(
      [],
    );
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

describe('hand-holding lines', () => {
  it('tells the person what comes next on every screen but the last', () => {
    for (const step of STEP_ORDER) {
      if (step === 'done') expect(copy.NEXT_UP[step]).toBe('');
      else expect(copy.NEXT_UP[step]).toMatch(/^Next: /);
    }
  });

  it('explains each of the three boxes in one plain sentence', () => {
    expect(copy.ACKNOWLEDGMENT_NOTES).toHaveLength(copy.ACKNOWLEDGMENTS.length);
    for (const note of copy.ACKNOWLEDGMENT_NOTES) expect(note).toMatch(/^In plain words: /);
  });

  it('counts the minutes left from the current screen on', () => {
    expect(copy.minutesToGo('follow-up', STEP_ORDER)).toBe('about a minute to go');
    expect(copy.minutesToGo('review', STEP_ORDER)).toBe('about 2 minutes to go');
    expect(copy.minutesToGo('contact', STEP_ORDER)).toBe('about 10 minutes to go');
    expect(copy.minutesToGo('done', STEP_ORDER)).toBe('about a minute to go');
  });

  it('lists what not to send and mentions another lawyer’s files', () => {
    expect(copy.DOCUMENTS_COPY.doNotSend.length).toBeGreaterThanOrEqual(1);
    expect(copy.DOCUMENTS_COPY.doNotSend.join(' ')).toMatch(/lawyer/);
  });

  it('gives the done screen three short lines', () => {
    expect(copy.DONE_NEXT).toHaveLength(3);
    for (const line of copy.DONE_NEXT) expect(line.length).toBeLessThan(80);
  });
});
