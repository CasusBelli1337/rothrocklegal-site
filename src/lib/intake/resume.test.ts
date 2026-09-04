import { describe, expect, it } from 'vitest';
import type { EvaluationClientView, IntakeSession, ResumeResponse, StoryRead } from './contract';
import { evaluationKey, storyKey } from './readings';
import {
  LOOKUP_IDLE,
  firstIncompleteStep,
  isResumeResponse,
  lookupReducer,
  normalizeEmail,
  readResumeToken,
  resumeStep,
  stateFromResume,
  type LookupEvent,
} from './resume';
import { emptyAnswers, emptyState, type IntakeState } from './state';

const session = (status: IntakeSession['status'] = 'draft'): IntakeSession => ({
  id: 'i1',
  token: 't1',
  status,
  reference: 'RL-2026-000042',
});

const storyRead: StoryRead = {
  situations: ['trust-contests'],
  whatWeUnderstood: 'Your father died and the trust changed.',
  parties: [{ name: 'John Doe', role: 'decedent' }],
  documents: [{ label: 'The trust', why: 'w' }],
};

const evaluation: EvaluationClientView = {
  headline: 'h',
  whatWeUnderstood: 'w',
  parties: [{ name: 'John Doe', role: 'decedent' }],
  askValue: false,
  modules: [{ id: 'q', type: 'yes_no', label: 'Q', why: 'w', required: false }],
};

function response(
  status: IntakeSession['status'] = 'draft',
  step?: string,
  extra: Partial<ResumeResponse> = {},
): ResumeResponse {
  return {
    session: session(status),
    answers: {
      ...emptyAnswers(),
      contact: { fullName: 'Jane Doe', email: 'jane@example.com', replyBy: 'email' },
      situations: ['trust-contests'],
      parties: [{ name: 'John Doe', role: 'decedent' }],
      story: 'My father died and the trust changed.',
    },
    files: [
      {
        id: 'f1',
        slot: 'documents',
        name: 'trust.pdf',
        size: 10,
        mimeType: 'application/pdf',
        uploadedAt: 'now',
      },
    ],
    step,
    ...extra,
  };
}

describe('readResumeToken', () => {
  it('reads the token and ignores everything else', () => {
    expect(readResumeToken('?resume=abc123')).toBe('abc123');
    expect(readResumeToken('?x=1&resume=%20abc%20')).toBe('abc');
    expect(readResumeToken('?resume=')).toBeNull();
    expect(readResumeToken('')).toBeNull();
    expect(readResumeToken('?category=Deadlines')).toBeNull();
  });
});

describe('firstIncompleteStep', () => {
  it('walks to the first screen with a missing answer, in the v3 order', () => {
    const state = stateFromResume(response());
    expect(firstIncompleteStep(state)).toBe('review');
    state.answers.parties = [];
    expect(firstIncompleteStep(state)).toBe('parties');
    state.answers.situations = [];
    expect(firstIncompleteStep(state)).toBe('situations');
    state.answers.story = '';
    expect(firstIncompleteStep(state)).toBe('story');
    state.answers.contact.email = '';
    expect(firstIncompleteStep(state)).toBe('contact');
  });
});

describe('resumeStep', () => {
  const complete = stateFromResume(response());

  it('opens anything already sent on the done screen', () => {
    expect(resumeStep('submitted', complete)).toBe('done');
    expect(resumeStep('reviewed', complete)).toBe('done');
    expect(resumeStep('conflict-hold', complete, 'contact')).toBe('done');
    expect(resumeStep('declined', complete)).toBe('done');
  });

  it('opens a request in progress on the earlier of the remembered screen and the first gap', () => {
    expect(resumeStep('draft', complete)).toBe('review');
    expect(resumeStep('draft', complete, 'documents')).toBe('documents');
    expect(resumeStep('evaluating', complete, 'scope')).toBe('scope');
    expect(resumeStep('follow-up', complete, 'review')).toBe('review');
    const gap: IntakeState = { ...complete, answers: { ...complete.answers, story: '' } };
    expect(resumeStep('draft', gap, 'scope')).toBe('story');
  });

  it('ignores a screen it cannot land on, including a follow-up with no questions', () => {
    expect(resumeStep('draft', complete, 'start')).toBe('review');
    expect(resumeStep('draft', complete, 'done')).toBe('review');
    expect(resumeStep('draft', complete, 'nowhere')).toBe('review');
    expect(resumeStep('draft', complete, 'follow-up')).toBe('review');
    const withQuestions = stateFromResume(response('follow-up', 'follow-up', { evaluation }));
    expect(withQuestions.step).toBe('follow-up');
  });
});

describe('stateFromResume', () => {
  it('restores session, answers, files and skips the start tiles', () => {
    const state = stateFromResume(response('draft', 'documents'));
    expect(state.session).toEqual(session());
    expect(state.startTile).toBe(2);
    expect(state.acks).toEqual([true, true, true]);
    expect(state.answers.acknowledgedDisclaimers).toBe(true);
    expect(state.answers.contact.fullName).toBe('Jane Doe');
    expect(state.files).toHaveLength(1);
    expect(state.step).toBe('documents');
    expect(state.storyRead).toBeNull();
    expect(state.storyReadFor).toBeNull();
    expect(state.evaluation).toBeNull();
    expect(state.evaluationFor).toBeNull();
  });

  it('carries the story read and the evaluation so neither screen waits twice', () => {
    const state = stateFromResume(response('follow-up', 'scope', { storyRead, evaluation }));
    expect(state.storyRead).toEqual(storyRead);
    expect(state.storyReadFor).toBe(storyKey(state));
    expect(state.evaluation).toEqual(evaluation);
    expect(state.evaluationFor).toBe(evaluationKey(state));
    expect(state.step).toBe('scope');
  });

  it('brings back the follow-up answers, dropping any the evaluation no longer asks', () => {
    const state = stateFromResume(
      response('follow-up', 'follow-up', {
        evaluation,
        followUpAnswers: { q: true, gone: 'stale' },
      }),
    );
    expect(state.followUpAnswers).toEqual({ q: true });
  });

  it('starts with no follow-up answers when the server sent none', () => {
    expect(stateFromResume(response('draft', 'scope')).followUpAnswers).toEqual({});
    expect(
      stateFromResume(response('follow-up', 'follow-up', { followUpAnswers: { q: true } }))
        .followUpAnswers,
    ).toEqual({});
  });

  it('fills defaults when the server sends less than the client keeps', () => {
    const thin = {
      session: session(),
      answers: { contact: { fullName: 'J' } },
      files: undefined,
    } as unknown as ResumeResponse;
    const state = stateFromResume(thin);
    expect(state.files).toEqual([]);
    expect(state.answers.contact).toEqual({ fullName: 'J', email: '', replyBy: 'email' });
    expect(state.step).toBe('contact');
  });
});

describe('isResumeResponse', () => {
  it('accepts the real shape and rejects the rest', () => {
    expect(isResumeResponse(response())).toBe(true);
    expect(isResumeResponse({ session: { id: 'x' }, answers: {} })).toBe(false);
    expect(isResumeResponse({ answers: {} })).toBe(false);
    expect(isResumeResponse(null)).toBe(false);
    expect(isResumeResponse('token')).toBe(false);
    expect(isResumeResponse({ ...response(), answers: null })).toBe(false);
  });
});

describe('lookupReducer', () => {
  const run = (...events: LookupEvent[]) => events.reduce(lookupReducer, LOOKUP_IDLE);
  const jane = 'jane@example.com';

  it('checks once per address and shows the same card whatever the server answered', () => {
    expect(run({ type: 'check', email: jane })).toEqual({ phase: 'checking', email: jane });
    expect(
      run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true }),
    ).toEqual({ phase: 'answered', email: jane });
    expect(
      run({ type: 'check', email: jane }, { type: 'result', email: jane, found: false }),
    ).toEqual({ phase: 'answered', email: jane });
  });

  it('does not re-check an address it already answered', () => {
    const found = run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true });
    expect(lookupReducer(found, { type: 'check', email: jane })).toBe(found);
  });

  it('starts over for a different address', () => {
    const found = run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true });
    expect(lookupReducer(found, { type: 'check', email: 'other@example.com' })).toEqual({
      phase: 'checking',
      email: 'other@example.com',
    });
  });

  it('ignores a stale answer for an address no longer being checked', () => {
    const checking = run({ type: 'check', email: 'other@example.com' });
    expect(lookupReducer(checking, { type: 'result', email: jane, found: true })).toBe(checking);
    expect(lookupReducer(LOOKUP_IDLE, { type: 'result', email: jane, found: true })).toBe(
      LOOKUP_IDLE,
    );
  });

  it('dismisses only a showing card, and stays dismissed for that address', () => {
    const found = run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true });
    const dismissed = lookupReducer(found, { type: 'dismiss' });
    expect(dismissed.phase).toBe('dismissed');
    expect(lookupReducer(dismissed, { type: 'check', email: jane })).toBe(dismissed);
    expect(lookupReducer(LOOKUP_IDLE, { type: 'dismiss' })).toBe(LOOKUP_IDLE);
  });

  it('normalizes addresses so case and spaces do not cause a second lookup', () => {
    expect(normalizeEmail('  Jane@Example.com ')).toBe('jane@example.com');
  });
});

describe('emptyState stays the shape resume builds on', () => {
  it('has no session and starts at the first tile', () => {
    expect(emptyState().session).toBeNull();
    expect(emptyState().step).toBe('start');
    expect(emptyState().startTile).toBe(0);
  });
});
