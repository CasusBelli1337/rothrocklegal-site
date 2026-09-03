import { describe, expect, it } from 'vitest';
import type { IntakeSession, ResumeResponse } from './contract';
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

function response(status: IntakeSession['status'] = 'draft', step?: string): ResumeResponse {
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
        slot: 'trust',
        name: 'trust.pdf',
        size: 10,
        mimeType: 'application/pdf',
        uploadedAt: 'now',
      },
    ],
    step,
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
  it('walks to the first screen with a missing answer', () => {
    const state = stateFromResume(response());
    expect(firstIncompleteStep(state)).toBe('review');
    state.answers.story = '';
    expect(firstIncompleteStep(state)).toBe('story');
    state.answers.parties = [];
    expect(firstIncompleteStep(state)).toBe('parties');
    state.answers.contact.email = '';
    expect(firstIncompleteStep(state)).toBe('contact');
  });
});

describe('resumeStep', () => {
  const complete = stateFromResume(response());

  it('follows the status past the review', () => {
    expect(resumeStep('submitted', complete)).toBe('done');
    expect(resumeStep('reviewed', complete)).toBe('done');
    expect(resumeStep('follow-up', complete, 'contact')).toBe('follow-up');
    expect(resumeStep('evaluating', complete)).toBe('review');
  });

  it('opens a draft on the earlier of the remembered screen and the first gap', () => {
    expect(resumeStep('draft', complete)).toBe('review');
    expect(resumeStep('draft', complete, 'documents')).toBe('documents');
    expect(resumeStep('draft', complete, 'review')).toBe('review');
    const gap: IntakeState = { ...complete, answers: { ...complete.answers, story: '' } };
    expect(resumeStep('draft', gap, 'scope')).toBe('story');
  });

  it('ignores a screen it cannot land on', () => {
    expect(resumeStep('draft', complete, 'start')).toBe('review');
    expect(resumeStep('draft', complete, 'done')).toBe('review');
    expect(resumeStep('draft', complete, 'nowhere')).toBe('review');
  });
});

describe('stateFromResume', () => {
  it('restores session, answers, files and ticks the boxes', () => {
    const state = stateFromResume(response('draft', 'documents'));
    expect(state.session).toEqual(session());
    expect(state.acks).toEqual([true, true, true]);
    expect(state.answers.acknowledgedDisclaimers).toBe(true);
    expect(state.answers.contact.fullName).toBe('Jane Doe');
    expect(state.files).toHaveLength(1);
    expect(state.step).toBe('documents');
    expect(state.evaluation).toBeNull();
    expect(state.unsureDates).toEqual([]);
  });

  it('carries the evaluation into the follow-up screen', () => {
    const view = { headline: 'h', whatWeUnderstood: 'w', modules: [] };
    const state = stateFromResume(response('follow-up'), view);
    expect(state.step).toBe('follow-up');
    expect(state.evaluation).toEqual(view);
  });

  it('fills defaults when the server sends less than the client keeps', () => {
    const thin = {
      session: session(),
      answers: { contact: { fullName: 'J' } },
      files: undefined,
    } as unknown as ResumeResponse;
    const state = stateFromResume(thin);
    expect(state.files).toEqual([]);
    expect(state.answers.contact).toEqual({
      fullName: 'J',
      email: '',
      replyBy: 'email',
    });
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

  it('checks once per address and shows the card on a match', () => {
    expect(run({ type: 'check', email: jane })).toEqual({ phase: 'checking', email: jane });
    expect(
      run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true }),
    ).toEqual({ phase: 'found', email: jane });
    expect(
      run({ type: 'check', email: jane }, { type: 'result', email: jane, found: false }),
    ).toEqual({ phase: 'clear', email: jane });
  });

  it('does not re-check an address it already answered', () => {
    const found = run({ type: 'check', email: jane }, { type: 'result', email: jane, found: true });
    expect(lookupReducer(found, { type: 'check', email: jane })).toBe(found);
    const clear = run(
      { type: 'check', email: jane },
      { type: 'result', email: jane, found: false },
    );
    expect(lookupReducer(clear, { type: 'check', email: jane })).toBe(clear);
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
  it('has no session and starts at the beginning', () => {
    expect(emptyState().session).toBeNull();
    expect(emptyState().step).toBe('start');
  });
});
