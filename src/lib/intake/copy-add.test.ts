import { describe, expect, it } from 'vitest';
import { collectStrings, voiceViolations } from '@/lib/voice-guide';
import { ADDITION_RULES } from './contract';
import * as copy from './copy-add';
import { REPLY_PROMISE } from './copy-start';

describe('add page copy', () => {
  const lines = [
    ...collectStrings(copy),
    copy.ADD_OPEN_COPY.title('RL-2026-000123'),
    copy.ADD_OPEN_COPY.sentOn('October 1, 2026'),
    copy.ADD_OPEN_COPY.noteCount(1234),
    copy.ADD_DONE_COPY.body('RL-2026-000123', 0, true),
    copy.ADD_DONE_COPY.body('RL-2026-000123', 1, false),
    copy.ADD_DONE_COPY.body('RL-2026-000123', 3, true),
  ];

  it('keeps the voice guide: no em dash, no banned word, no outcome promise', () => {
    expect(lines.filter((l) => l.includes('—'))).toEqual([]);
    expect(voiceViolations(lines)).toEqual([]);
    expect(lines.filter((l) => /\b(guarantee|we will win|you will win)\b/i.test(l))).toEqual([]);
  });

  it('never says whether a request exists on the email card', () => {
    const card = [
      copy.ADD_ASK_COPY.cardBody,
      copy.ADD_ASK_COPY.cardSpam,
      copy.ADD_ASK_COPY.cardNothing,
    ];
    expect(card.filter((l) => /\b(found|no request|we have your)\b/i.test(l))).toEqual([]);
    expect(copy.ADD_ASK_COPY.cardBody).toMatch(/^If we have a request/);
  });

  it('says what was added, in one sentence for each case', () => {
    expect(copy.ADD_DONE_COPY.body('RL-1', 0, true)).toBe('We added your note to request RL-1.');
    expect(copy.ADD_DONE_COPY.body('RL-1', 1, false)).toBe('We added 1 document to request RL-1.');
    expect(copy.ADD_DONE_COPY.body('RL-1', 3, true)).toBe(
      'We added your note and 3 documents to request RL-1.',
    );
  });

  it('ends the done screen on the one reply promise and counts the note against the server cap', () => {
    expect(copy.ADD_DONE_COPY.next.at(-1)).toBe(REPLY_PROMISE);
    expect(copy.ADD_OPEN_COPY.noteCount(1234)).toBe(
      `1,234 of ${ADDITION_RULES.maxNoteChars.toLocaleString('en-US')} characters`,
    );
  });

  it('keeps sentences short', () => {
    const sentences = lines.flatMap((l) => l.split(/(?<=[.?!])\s+/));
    expect(sentences.filter((s) => s.split(/\s+/).length > 26)).toEqual([]);
  });
});
