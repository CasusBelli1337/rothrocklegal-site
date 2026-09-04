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

const WITHOUT_FOLLOW_UP = STEP_ORDER.filter((step) => step !== 'follow-up');

describe('intake copy hygiene', () => {
  const lines = strings(copy);

  it('has copy to check', () => {
    expect(lines.length).toBeGreaterThan(80);
  });

  it('uses no em dashes', () => {
    expect(lines.filter((line) => line.includes('\u2014'))).toEqual([]);
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
  });
});

describe('hand-holding lines', () => {
  it('gives every numbered screen a "Next:" line, and the done screen none', () => {
    for (const step of STEP_ORDER) {
      if (step === 'done') expect(copy.NEXT_UP[step]).toBe('');
      else expect(copy.NEXT_UP[step]).toMatch(/^Next: /);
    }
  });

  it('titles every screen and every start tile', () => {
    for (const step of STEP_ORDER) expect(copy.STEP_TITLES[step].title.length).toBeGreaterThan(3);
    expect(Object.keys(copy.START_TILES)).toEqual(['0', '1', '2']);
    expect(copy.START_TILES[2].button).toBe('Start');
    expect(copy.BEFORE_WE_START).toHaveLength(3);
  });

  it('explains each of the three boxes in one plain sentence', () => {
    expect(copy.ACKNOWLEDGMENT_NOTES).toHaveLength(copy.ACKNOWLEDGMENTS.length);
    for (const note of copy.ACKNOWLEDGMENT_NOTES) expect(note).toMatch(/^In plain words: /);
  });

  it('asks the person to read and agree, and never to tick every box', () => {
    expect(copy.ACKNOWLEDGMENTS_LEGEND).toBe(
      'Please read each statement carefully. If you understand it and agree, tick its box.',
    );
    expect(copy.START_TILES[2].title).toBe('Three things to read carefully');
    for (const line of [copy.ACKNOWLEDGMENTS_LEGEND, copy.START_TILES[2].title])
      expect(line).not.toMatch(/tick (all|the |three|every|both)/i);
  });

  it('counts the minutes left from the current screen on', () => {
    expect(copy.minutesToGo('review', STEP_ORDER)).toBe('about a minute to go');
    expect(copy.minutesToGo('follow-up', STEP_ORDER)).toBe('about 2 minutes to go');
    // The documents screen's count includes the evaluation wait the next screen announces.
    expect(copy.minutesToGo('documents', WITHOUT_FOLLOW_UP)).toBe('about 6 minutes to go');
    expect(copy.minutesToGo('contact', STEP_ORDER)).toBe('about 11 minutes to go');
    expect(copy.minutesToGo('contact', WITHOUT_FOLLOW_UP)).toBe('about 10 minutes to go');
    expect(copy.minutesToGo('done', STEP_ORDER)).toBe('about a minute to go');
  });

  it('never tells a stranger whether an email address has a request', () => {
    expect(copy.LOOKUP_CARD.body).toBe(
      'Started this before on another device? If a request already exists under this address, a link to continue it is on its way to that inbox. Otherwise, just keep going.',
    );
    expect(copy.LOOKUP_CARD.body).not.toMatch(/we (just )?sent|you started|before\./i);
    expect(copy.LOOKUP_CARD.startFresh).toBe('Keep going');
  });

  it('says what not to send in one line that mentions another lawyer’s files', () => {
    expect(copy.DOCUMENTS_COPY.doNotSend).toMatch(/lawyer/);
    expect(copy.DOCUMENTS_COPY.doNotSend.length).toBeLessThan(160);
  });

  it('keeps the story screen to one line of guidance', () => {
    expect(copy.STEP_TITLES.story.lead).toBe(
      'In your own words: who, what, when, where, and how. Type it or tap the microphone.',
    );
  });

  it('gives the done screen three short lines', () => {
    expect(copy.DONE_NEXT).toHaveLength(3);
    for (const line of copy.DONE_NEXT) expect(line.length).toBeLessThan(80);
  });

  it('explains that the microphone needs https and that typing still works', () => {
    expect(copy.MIC_INSECURE.body).toMatch(/https/);
    expect(copy.MIC_INSECURE.body).toMatch(/Typing works/);
  });
});
