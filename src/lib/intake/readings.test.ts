import { describe, expect, it } from 'vitest';
import type { EvaluationClientView, StoryRead } from './contract';
import {
  evaluationKey,
  markEvaluationBackground,
  markEvaluationUnavailable,
  markStoryReadUnavailable,
  needsEvaluation,
  needsStoryRead,
  receiveEvaluation,
  receiveStoryRead,
  storyKey,
  whatWeUnderstood,
} from './readings';
import { emptyState, type IntakeState } from './state';

function draft(story = 'My mother died in March. My brother has the trust.'): IntakeState {
  const state = emptyState();
  state.answers.story = story;
  return state;
}

const read: StoryRead = {
  situations: ['trust-contests', 'not-a-real-key' as never],
  whatWeUnderstood: 'Your mother died and the trust may have changed.',
  parties: [
    { name: 'Mother', role: 'decedent' },
    { name: '  ', role: 'trustee' },
  ],
  documents: [{ label: 'The trust', why: 'Its words decide most disputes.' }],
};

const view: EvaluationClientView = {
  headline: 'We read it.',
  whatWeUnderstood: 'Fuller reading.',
  parties: [{ name: 'Brother', role: 'trustee' }],
  askValue: true,
  modules: [{ id: 'q1', type: 'yes_no', label: 'Q', why: 'w', required: false }],
};

describe('pass 1: the story read', () => {
  it('runs once per story and again only when the story changes', () => {
    const state = draft();
    expect(needsStoryRead(state)).toBe(true);
    const after = receiveStoryRead(state, read);
    expect(needsStoryRead(after)).toBe(false);
    expect(
      needsStoryRead({ ...after, answers: { ...after.answers, story: 'Something new.' } }),
    ).toBe(true);
    // Only whitespace changed: no second read.
    expect(
      needsStoryRead({
        ...after,
        answers: { ...after.answers, story: `${state.answers.story}  ` },
      }),
    ).toBe(false);
  });

  it('counts a voice note as part of the story', () => {
    const typed = draft('');
    expect(storyKey(typed)).toBe('|');
    const spoken = { ...typed, answers: { ...typed.answers, voiceNoteFileId: 'v1' } };
    expect(storyKey(spoken)).toBe('|v1');
    expect(needsStoryRead(markStoryReadUnavailable(typed))).toBe(false);
    expect(needsStoryRead({ ...markStoryReadUnavailable(typed), answers: spoken.answers })).toBe(
      true,
    );
  });

  it('pre-ticks the situations it knows and drops unnamed people', () => {
    const after = receiveStoryRead(draft(), read);
    expect(after.answers.situations).toEqual(['trust-contests']);
    expect(after.storyRead?.situations).toEqual(['trust-contests']);
    expect(after.storyRead?.parties).toEqual([{ name: 'Mother', role: 'decedent' }]);
    expect(after.storyRead?.documents).toEqual(read.documents);
  });

  it('remembers an unavailable read so the manual screen shows once', () => {
    const after = markStoryReadUnavailable(draft());
    expect(after.storyRead).toBeNull();
    expect(needsStoryRead(after)).toBe(false);
    expect(after.answers.situations).toEqual([]);
  });
});

describe('pass 2: the evaluation', () => {
  it('is keyed to the story and the files sent', () => {
    const state = draft();
    expect(needsEvaluation(state)).toBe(true);
    const after = receiveEvaluation(state, view);
    expect(needsEvaluation(after)).toBe(false);
    const withFile = {
      ...after,
      files: [
        { id: 'f1', slot: 'documents', name: 'a.pdf', size: 1, mimeType: 'x', uploadedAt: 'now' },
      ],
    };
    expect(needsEvaluation(withFile)).toBe(true);
    expect(evaluationKey(withFile)).toBe(`${storyKey(state)}|f1`);
  });

  it('seeds the people once, only while nobody is named', () => {
    const seeded = receiveEvaluation(draft(), view);
    expect(seeded.answers.parties).toEqual([{ name: 'Brother', role: 'trustee' }]);
    const edited = {
      ...seeded,
      answers: { ...seeded.answers, parties: [{ name: 'Someone else', role: 'family' as const }] },
    };
    expect(receiveEvaluation(edited, view).answers.parties).toEqual(edited.answers.parties);
  });

  it('falls back to the story read when the evaluation is unavailable', () => {
    const withRead = receiveStoryRead(draft(), read);
    const after = markEvaluationUnavailable(withRead);
    expect(after.evaluation).toBeNull();
    expect(needsEvaluation(after)).toBe(false);
    expect(after.answers.parties).toEqual([{ name: 'Mother', role: 'decedent' }]);
    expect(markEvaluationUnavailable(draft()).answers.parties).toEqual([]);
  });

  it('keeps only follow-up answers for modules that still exist', () => {
    const state = { ...draft(), followUpAnswers: { q1: true, gone: 'x' } };
    expect(receiveEvaluation(state, view).followUpAnswers).toEqual({ q1: true });
    expect(markEvaluationUnavailable(state).followUpAnswers).toEqual({});
  });

  it('prefers the fuller reading for "what we understood"', () => {
    expect(whatWeUnderstood(draft())).toBeNull();
    const withRead = receiveStoryRead(draft(), read);
    expect(whatWeUnderstood(withRead)).toBe(read.whatWeUnderstood);
    expect(whatWeUnderstood(receiveEvaluation(withRead, view))).toBe('Fuller reading.');
  });
});

describe('an evaluation that names nobody', () => {
  it('seeds the people from pass 1 instead of leaving the list empty', () => {
    const withRead = receiveStoryRead(draft(), read);
    const after = receiveEvaluation(withRead, { ...view, parties: [] });
    expect(after.evaluation?.parties).toEqual([]);
    expect(after.answers.parties).toEqual([{ name: 'Mother', role: 'decedent' }]);
  });
});

describe('keep going while the server finishes reading', () => {
  it('seeds the people from pass 1, skips the follow-up screen, and remembers that the reading continues', () => {
    const withRead = receiveStoryRead(draft(), read);
    const after = markEvaluationBackground(withRead);
    expect(after.readingInBackground).toBe(true);
    expect(after.evaluation).toBeNull();
    expect(after.followUpAnswers).toEqual({});
    expect(after.answers.parties).toEqual([{ name: 'Mother', role: 'decedent' }]);
    // The same story and files never start a second wait.
    expect(evaluationKey(after)).toBe(after.evaluationFor);
    expect(needsEvaluation(after)).toBe(false);
  });

  it('a later evaluation, or a plain failure, clears the background note', () => {
    const background = markEvaluationBackground(draft());
    expect(receiveEvaluation(background, view).readingInBackground).toBe(false);
    expect(markEvaluationUnavailable(background).readingInBackground).toBe(false);
  });
});
