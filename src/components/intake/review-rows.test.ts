import { describe, expect, it } from 'vitest';
import type { EvaluationClientView, IntakeFile } from '@/lib/intake/contract';
import { emptyState, type IntakeState } from '@/lib/intake/state';
import { reviewRows } from './review-rows';

const evaluation: EvaluationClientView = {
  headline: 'h',
  whatWeUnderstood: 'Your father died and the trust changed.',
  parties: [],
  askValue: false,
  modules: [
    { id: 'card', type: 'info', title: 'T', body: 'B' },
    {
      id: 'notice-date',
      type: 'date',
      label: 'When did the letter arrive?',
      why: 'w',
      required: true,
    },
    {
      id: 'has-copy',
      type: 'yes_no',
      label: 'Do you have a copy of the trust?',
      why: 'w',
      required: false,
    },
    {
      id: 'send-the-deed',
      type: 'upload',
      label: 'Send the deed',
      why: 'w',
      multiple: true,
      required: false,
    },
  ],
};

const deed: IntakeFile = {
  id: 'f1',
  slot: 'send-the-deed',
  name: 'deed.pdf',
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: 'now',
};

function withQuestions(): IntakeState {
  return {
    ...emptyState(),
    evaluation,
    files: [deed],
    followUpAnswers: { 'notice-date': '2026-03-02', 'has-copy': true },
  };
}

describe('reviewRows', () => {
  it('leaves out the follow-up block when the evaluation asked nothing', () => {
    const labels = reviewRows(emptyState()).map((row) => row.label);
    expect(labels).toEqual([
      'You',
      'What we understood',
      'What is going on',
      'Documents',
      'People involved',
      'Scope and cost',
    ]);
  });

  it('reads the follow-up answers back, last, with an Edit link to that screen', () => {
    const rows = reviewRows(withQuestions());
    const row = rows[rows.length - 1];
    expect(row.label).toBe('Your answers to our questions');
    expect(row.step).toBe('follow-up');
    expect(row.lines).toEqual([
      'When did the letter arrive? March 2, 2026',
      'Do you have a copy of the trust? Yes',
      'Send the deed: 1 file sent',
    ]);
  });

  it('says so when a question was left alone', () => {
    const state = { ...withQuestions(), followUpAnswers: { 'has-copy': null } };
    const rows = reviewRows(state);
    expect(rows[rows.length - 1].lines).toEqual([
      'When did the letter arrive? Not answered',
      'Do you have a copy of the trust? Skipped for now',
      'Send the deed: 1 file sent',
    ]);
  });
});
