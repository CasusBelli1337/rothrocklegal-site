import { describe, expect, it } from 'vitest';
import { BANNED_PHRASES, BANNED_WORDS, collectStrings } from '@/lib/voice-guide';
import type { EvaluationClientView } from './contract';
import * as copy from './copy';
import { STEP_ORDER, emptyState, type IntakeState, type StepId } from './state';

const WITH_QUESTIONS: EvaluationClientView = {
  headline: 'h',
  whatWeUnderstood: 'w',
  parties: [],
  askValue: false,
  modules: [{ id: 'notice-date', type: 'date', label: 'When?', why: 'w', required: false }],
};

/** The "Next:" line on each screen of one flow, in order. */
function nextLines(evaluation: EvaluationClientView | null): [StepId, string][] {
  const base: IntakeState = { ...emptyState(), evaluation };
  const steps = STEP_ORDER.filter((step) => evaluation || step !== 'follow-up');
  return steps.map((step) => [step, copy.nextUpLine({ ...base, step })]);
}

describe('intake copy hygiene', () => {
  const lines = collectStrings(copy);

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

  it("builds the first tile's reply line from the one reply promise and the video note", () => {
    expect(copy.HOW_THIS_WORKS[2]).toBe(
      `A lawyer reads everything. ${copy.REPLY_PROMISE} ${copy.REMOTE_NOTE}`,
    );
  });
});

const lines = () => collectStrings(copy);

describe('hand-holding lines', () => {
  it('gives every screen the button can lead to a "Next:" line', () => {
    for (const line of Object.values(copy.NEXT_UP)) expect(line).toMatch(/^Next: /);
    expect(Object.keys(copy.NEXT_UP)).toEqual(STEP_ORDER.filter((step) => step !== 'start'));
  });

  it('names the screen that actually comes next, with the follow-up questions', () => {
    expect(nextLines(WITH_QUESTIONS)).toEqual([
      ['start', 'Next: how we can reach you.'],
      ['contact', 'Next: tell us what happened, in your own words.'],
      ['story', 'Next: we read your story and show you what we understood.'],
      ['situations', 'Next: send any papers you have. None yet is fine.'],
      ['documents', 'Next: we read what you sent, then show you who is involved.'],
      ['parties', 'Next: a rough idea of what is at stake and how you would pay.'],
      ['scope', 'Next: a few more questions, all optional.'],
      ['follow-up', 'Next: check everything before you send it.'],
      ['review', 'Next: your reference number, and what happens after that.'],
      ['done', ''],
    ]);
  });

  it('names the screen that actually comes next, without them', () => {
    // Regression (2026-10-02): "Scope and cost" promised the review while the questions came next.
    const lines = nextLines(null);
    expect(lines.find(([step]) => step === 'scope')?.[1]).toBe(
      'Next: check everything before you send it.',
    );
    expect(lines.map(([step]) => step)).not.toContain('follow-up');
    expect(lines.filter(([, line]) => line === '').map(([step]) => step)).toEqual(['done']);
  });

  it('titles every screen and every start tile', () => {
    for (const step of STEP_ORDER) expect(copy.STEP_TITLES[step].title.length).toBeGreaterThan(3);
    expect(Object.keys(copy.START_TILES)).toEqual(['0', '1', '2']);
    expect(copy.START_TILES[2].button).toBe('Start');
    expect(copy.HOW_THIS_WORKS).toHaveLength(3);
  });

  it('explains each of the three boxes in one plain sentence', () => {
    expect(copy.ACKNOWLEDGMENT_NOTES).toHaveLength(copy.ACKNOWLEDGMENTS.length);
    for (const note of copy.ACKNOWLEDGMENT_NOTES) expect(note).toMatch(/^In plain words: /);
  });

  it('asks the person to read and agree, and never to tick every box', () => {
    expect(copy.ACKNOWLEDGMENTS_LEGEND).toBe(
      'Please read each statement carefully. If you understand it and agree, tick its box.',
    );
    expect(copy.START_TILES[2].title).toBe('What we do with what you send');
    for (const line of [copy.ACKNOWLEDGMENTS_LEGEND, copy.START_TILES[2].title])
      expect(line).not.toMatch(/tick (all|the |three|every|both)/i);
  });

  it('promises no number of minutes', () => {
    // Regression (2026-10-02): "about 3 minutes" became "about 4" when the questions appeared.
    expect('minutesToGo' in copy).toBe(false);
    expect('STEP_MINUTES' in copy).toBe(false);
    expect(lines().filter((line) => /\b\d+ minutes\b/.test(line))).toEqual([]);
  });

  it('asks the same question before anything clears the flow', () => {
    expect(copy.START_OVER_CONFIRM).toBe('Start over? This clears everything you entered.');
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

  it("runs the start tiles in Arthur's order: the process, what you get, what we do with it", () => {
    expect(Object.values(copy.START_TILES).map((tile) => tile.title)).toEqual([
      'How this works',
      'What you get, whether or not we take your case',
      'What we do with what you send',
    ]);
    expect(copy.WHAT_YOU_GET.map((item) => item.title)).toEqual([
      'Your file package.',
      'The deadlines that may apply.',
      'A straight answer.',
    ]);
    expect(copy.WHAT_WE_DO[0]).toMatch(/^We have to run a conflict check first\./);
  });

  it('says the package once on the start tiles, with the one link-expiry constant', () => {
    // The 2026-10-01 callout and fifth item said it too; the rewrite replaced both.
    expect('UP_FRONT' in copy).toBe(false);
    expect('AFTER_YOU_SEND' in copy).toBe(false);
    expect('BEFORE_WE_START' in copy).toBe(false);
    const tiles = collectStrings([
      copy.HOW_THIS_WORKS,
      copy.WHY_UP_FRONT,
      copy.WHAT_YOU_GET,
      copy.WHAT_WE_DO,
    ]);
    expect(tiles.filter((line) => /summary memo/i.test(line))).toEqual([copy.WHAT_YOU_GET[0].body]);
    expect(copy.WHAT_YOU_GET[0].body).toContain(`download it for ${copy.PACKAGE_LINK_DAYS} days`);
    expect(tiles.filter((line) => /\b\d+ days\b/.test(line) && !line.includes('120 days'))).toEqual(
      [copy.WHAT_YOU_GET[0].body],
    );
  });

  it('describes the package as one summary memo plus the documents, everywhere', () => {
    // Since 2026-10-02 the zip holds one PDF memo and the documents, nothing else (Arthur).
    expect(copy.WHAT_YOU_GET[0].body).toBe(
      `A summary memo of what you told us and the deadlines that may apply, with your documents organized and clearly named. We email you the link, and you can download it for ${copy.PACKAGE_LINK_DAYS} days. It is yours to keep or to hand to another lawyer.`,
    );
    expect(copy.PACKAGE_COPY.what).toBe(
      'A summary memo of what you told us, the deadlines that may apply, and your documents, organized and clearly named. It is yours to keep or to hand to another lawyer.',
    );
    expect(copy.REVIEW_PACKAGE_NOTE).toBe(
      'After you send, you can download a summary memo of what you told us, the deadlines that may apply, and your documents.',
    );
    expect(collectStrings(copy).filter((line) => /typed, said|plain summary/i.test(line))).toEqual(
      [],
    );
  });

  it('calls the summary a memo in the deadlines item, as the package item does', () => {
    expect(copy.WHAT_YOU_GET[1].body).toContain(
      'Your memo lists the deadlines that may apply to a situation like yours.',
    );
    expect(collectStrings(copy).filter((line) => /your summary lists/i.test(line))).toEqual([]);
  });

  it('points the deadlines item at the deadline tool, in the same tab', () => {
    const deadlines = copy.WHAT_YOU_GET[1];
    expect(deadlines.link).toEqual({
      before: 'You can also check a date with ',
      label: 'our deadline tool',
      href: '/how-long-do-i-have/',
      after: '.',
    });
    expect(deadlines.body).toMatch(/talk to a lawyer now\.$/);
  });

  it('keeps the package and review lines plain, with the one AI line on the third tile', () => {
    const generated = [
      copy.PACKAGE_COPY.expires('October 15, 2026'),
      copy.PACKAGE_COPY.contents('12.4 MB', 0),
      copy.PACKAGE_COPY.contents('12.4 MB', 1),
      copy.PACKAGE_COPY.contents('12.4 MB', 9),
    ];
    const lines = [
      ...collectStrings([copy.HOW_THIS_WORKS, copy.WHY_UP_FRONT, copy.WHAT_YOU_GET]),
      copy.WHAT_WE_DO[0],
      copy.REVIEW_PACKAGE_NOTE,
      ...collectStrings(copy.PACKAGE_COPY),
      ...generated,
    ];
    // "Our own tools", never a sales word; the AI line stays in the confidentiality line.
    for (const line of lines) {
      expect(line).not.toMatch(/proprietary|state-of-the-art|cutting-edge|\bAI\b|\u2014/i);
      expect(BANNED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(line))).toBe(false);
    }
    expect(copy.WHAT_WE_DO[1]).toMatch(/AI helps us organize it; a lawyer decides what it means\./);
  });

  it('explains that the microphone needs https and that typing still works', () => {
    expect(copy.MIC_INSECURE.body).toMatch(/https/);
    expect(copy.MIC_INSECURE.body).toMatch(/Typing works/);
  });
});
