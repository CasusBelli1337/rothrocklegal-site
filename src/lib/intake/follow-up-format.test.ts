import { describe, expect, it } from 'vitest';
import type { FollowUpModule, IntakeFile } from './contract';
import { followUpLines, formatFollowUpAnswer, longDate, questionLabel } from './follow-up-format';

const file = (id: string, slot: string): IntakeFile => ({
  id,
  slot,
  name: `${id}.pdf`,
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: 'now',
});

const shortText: FollowUpModule = {
  id: 'notice-date-known',
  type: 'short_text',
  label: 'Who sent the letter?',
  why: 'w',
  required: false,
};
const date: FollowUpModule = {
  id: 'notice-date',
  type: 'date',
  label: 'When did the letter arrive?',
  why: 'w',
  required: true,
};
const yesNo: FollowUpModule = {
  id: 'has-copy',
  type: 'yes_no',
  label: 'Do you have a copy of the trust?',
  why: 'w',
  required: false,
};
const choice: FollowUpModule = {
  id: 'who-else',
  type: 'choice',
  label: 'Who else is a beneficiary?',
  why: 'w',
  options: ['My sister', 'My brother'],
  multi: true,
  required: false,
};
const money: FollowUpModule = {
  id: 'value',
  type: 'money_range',
  label: 'Roughly how much is in dispute?',
  why: 'w',
  required: false,
};
const upload: FollowUpModule = {
  id: 'send-the-deed',
  type: 'upload',
  label: 'Send the deed',
  why: 'w',
  multiple: true,
  required: false,
};
const info: FollowUpModule = { id: 'note', type: 'info', title: 'T', body: 'B' };

describe('longDate', () => {
  it('reads the American long date out of the ISO parts, never through a Date', () => {
    expect(longDate('2026-03-02')).toBe('March 2, 2026');
    expect(longDate('2026-01-31')).toBe('January 31, 2026');
    expect(longDate('2026-12-01')).toBe('December 1, 2026');
  });

  it('does not shift the day in a west-coast time zone', () => {
    // `new Date('2026-03-02')` is midnight UTC, which is March 1 in California.
    expect(longDate('2026-03-01')).toBe('March 1, 2026');
  });

  it('returns null for anything that is not a calendar day', () => {
    expect(longDate('March 2, 2026')).toBeNull();
    expect(longDate('2026-13-02')).toBeNull();
    expect(longDate('2026-03-99')).toBeNull();
    expect(longDate('')).toBeNull();
  });
});

describe('formatFollowUpAnswer', () => {
  it('formats each answer type in plain English', () => {
    expect(formatFollowUpAnswer(shortText, 'My sister', [])).toBe('My sister');
    expect(formatFollowUpAnswer(date, '2026-03-02', [])).toBe('March 2, 2026');
    expect(formatFollowUpAnswer(yesNo, true, [])).toBe('Yes');
    expect(formatFollowUpAnswer(yesNo, false, [])).toBe('No');
    expect(formatFollowUpAnswer(choice, ['My sister', 'My brother'], [])).toBe(
      'My sister, My brother',
    );
    expect(formatFollowUpAnswer(money, '500k-1m', [])).toBe('$500,000 to $1 million');
  });

  it('says a question was skipped, or never answered', () => {
    expect(formatFollowUpAnswer(shortText, null, [])).toBe('Skipped for now');
    expect(formatFollowUpAnswer(shortText, undefined, [])).toBe('Not answered');
    expect(formatFollowUpAnswer(shortText, '   ', [])).toBe('Not answered');
    expect(formatFollowUpAnswer(choice, [], [])).toBe('Not answered');
  });

  it('counts the files sent to an upload question', () => {
    const files = [file('a', 'send-the-deed'), file('b', 'send-the-deed'), file('c', 'documents')];
    expect(formatFollowUpAnswer(upload, undefined, files)).toBe('2 files sent');
    expect(formatFollowUpAnswer(upload, undefined, [file('a', 'send-the-deed')])).toBe(
      '1 file sent',
    );
    expect(formatFollowUpAnswer(upload, ['a'], [file('a', 'send-the-deed')])).toBe('1 file sent');
  });

  it('tells an upload skipped on purpose from one never answered', () => {
    // Regression (2026-10-02): both read "No file sent" on the review screen.
    const elsewhere = [file('c', 'documents')];
    expect(formatFollowUpAnswer(upload, null, elsewhere)).toBe('Skipped for now');
    expect(formatFollowUpAnswer(upload, undefined, elsewhere)).toBe('Not answered');
    expect(formatFollowUpAnswer(upload, [], [])).toBe('Not answered');
  });

  it('shows an unreadable date as it was typed rather than dropping it', () => {
    expect(formatFollowUpAnswer(date, 'last March', [])).toBe('last March');
  });
});

describe('followUpLines', () => {
  it('gives one "question: answer" line per question, in the order asked, and skips info cards', () => {
    const lines = followUpLines(
      [info, date, yesNo, upload],
      { 'notice-date': '2026-03-02', 'has-copy': false },
      [file('a', 'send-the-deed')],
    );
    expect(lines).toEqual([
      'When did the letter arrive? March 2, 2026',
      'Do you have a copy of the trust? No',
      'Send the deed: 1 file sent',
    ]);
  });

  it("drops the evaluator's file-count note from the question", () => {
    const trust: FollowUpModule = {
      ...upload,
      id: 'trust-copy',
      label: 'The trust and any amendments (multiple files)',
    };
    const deed: FollowUpModule = { ...upload, label: 'The deed (one file)' };
    expect(followUpLines([trust, deed], { 'trust-copy': null }, [])).toEqual([
      'The trust and any amendments: Skipped for now',
      'The deed: Not answered',
    ]);
  });

  it('has nothing to show when the evaluation asked nothing', () => {
    expect(followUpLines([], {}, [])).toEqual([]);
    expect(followUpLines([info], {}, [])).toEqual([]);
  });
});

describe('questionLabel', () => {
  it('reads the question without the catalog note, and leaves everything else alone', () => {
    expect(questionLabel('Medical records or a diagnosis letter (multiple files)')).toBe(
      'Medical records or a diagnosis letter',
    );
    expect(questionLabel('The deed (One File)')).toBe('The deed');
    expect(questionLabel('Who drafted the amendment (if you know)?')).toBe(
      'Who drafted the amendment (if you know)?',
    );
  });
});
