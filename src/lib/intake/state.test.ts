import { describe, expect, it } from 'vitest';
import type { EvaluationClientView, FollowUpModule } from './contract';
import {
  STEP_ORDER,
  STORAGE_KEY,
  canGoBack,
  clearState,
  emptyState,
  hasFollowUp,
  isAnswered,
  loadState,
  mergeAnswers,
  nextStep,
  numberedStepCount,
  prevStep,
  saveState,
  stepNumber,
  visibleSteps,
  type IntakeState,
} from './state';
import { validateStep } from './validate';

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
}

export function filled(): IntakeState {
  const state = emptyState();
  state.startTile = 2;
  state.acks = [true, true, true];
  state.answers.contact = { fullName: 'Jane Doe', email: 'jane@example.com', replyBy: 'email' };
  state.answers.situations = ['trust-contests'];
  state.answers.parties = [{ name: 'John Doe', role: 'decedent' }];
  state.answers.story = 'My father died and the trust changed.';
  return state;
}

const withModules: EvaluationClientView = {
  headline: 'h',
  whatWeUnderstood: 'w',
  parties: [],
  askValue: false,
  modules: [{ id: 'a', type: 'short_text', label: 'A', why: 'w', required: false }],
};
const withoutModules: EvaluationClientView = { ...withModules, modules: [] };

function at(step: IntakeState['step'], evaluation: EvaluationClientView | null): IntakeState {
  return { ...filled(), step, evaluation };
}

describe('step order', () => {
  it('asks for the story before the situations and the documents before the people', () => {
    expect(STEP_ORDER).toEqual([
      'start',
      'contact',
      'story',
      'situations',
      'documents',
      'parties',
      'scope',
      'follow-up',
      'review',
      'done',
    ]);
  });

  it('shows the follow-up screen only when the evaluation left questions', () => {
    expect(hasFollowUp(at('scope', null))).toBe(false);
    expect(hasFollowUp(at('scope', withoutModules))).toBe(false);
    expect(hasFollowUp(at('scope', withModules))).toBe(true);
    expect(visibleSteps(at('scope', null))).not.toContain('follow-up');
    expect(visibleSteps(at('scope', withModules))).toContain('follow-up');
  });

  it('numbers the middle screens and counts 7 or 8 of them', () => {
    expect(stepNumber('start', at('start', null))).toBeNull();
    expect(stepNumber('contact', at('contact', null))).toBe(1);
    expect(stepNumber('review', at('review', null))).toBe(7);
    expect(numberedStepCount(at('review', null))).toBe(7);
    expect(stepNumber('follow-up', at('follow-up', withModules))).toBe(7);
    expect(stepNumber('review', at('review', withModules))).toBe(8);
    expect(numberedStepCount(at('review', withModules))).toBe(8);
    expect(stepNumber('done', at('done', withModules))).toBeNull();
  });

  it('skips the follow-up screen both ways when there are no modules', () => {
    expect(nextStep(at('scope', null))).toBe('review');
    expect(prevStep(at('review', null))).toBe('scope');
    expect(nextStep(at('scope', withoutModules))).toBe('review');
    expect(nextStep(at('scope', withModules))).toBe('follow-up');
    expect(prevStep(at('review', withModules))).toBe('follow-up');
  });

  it('stays inside the bounds', () => {
    expect(nextStep(at('start', null))).toBe('contact');
    expect(nextStep(at('done', null))).toBe('done');
    expect(prevStep(at('contact', null))).toBe('start');
    expect(prevStep(at('start', null))).toBe('start');
  });

  it('offers Back on every tile but the first and every screen but done', () => {
    expect(canGoBack({ ...emptyState(), startTile: 0 })).toBe(false);
    expect(canGoBack({ ...emptyState(), startTile: 1 })).toBe(true);
    expect(canGoBack(at('contact', null))).toBe(true);
    expect(canGoBack(at('follow-up', withModules))).toBe(true);
    expect(canGoBack(at('review', null))).toBe(true);
    expect(canGoBack(at('done', null))).toBe(false);
  });
});

describe('mergeAnswers', () => {
  it('deep-merges contact and replaces arrays', () => {
    const base = filled().answers;
    const merged = mergeAnswers(base, { contact: { phone: '408' }, situations: ['will-contests'] });
    expect(merged.contact).toEqual({ ...base.contact, phone: '408' });
    expect(merged.situations).toEqual(['will-contests']);
    expect(merged.story).toBe(base.story);
  });
});

describe('validateStep', () => {
  it('lets the first two start tiles advance and checks the boxes on the third', () => {
    const state = emptyState();
    expect(validateStep('start', { ...state, startTile: 0 })).toBeNull();
    expect(validateStep('start', { ...state, startTile: 1 })).toBeNull();
    expect(validateStep('start', { ...state, startTile: 2 })).toMatch(/three boxes/);
    state.acks = [true, true, false];
    expect(validateStep('start', { ...state, startTile: 2 })).toMatch(/three boxes/);
    state.acks = [true, true, true];
    expect(validateStep('start', { ...state, startTile: 2 })).toBeNull();
  });

  it('requires a name and a usable email', () => {
    const state = filled();
    state.answers.contact.fullName = ' ';
    expect(validateStep('contact', state)).toMatch(/name/);
    state.answers.contact.fullName = 'Jane';
    state.answers.contact.email = 'not-an-email';
    expect(validateStep('contact', state)).toMatch(/email/);
    state.answers.contact.email = 'jane@example.com';
    expect(validateStep('contact', state)).toBeNull();
  });

  it('accepts a voice note in place of a typed story', () => {
    const state = filled();
    state.answers.story = '';
    expect(validateStep('story', state)).toMatch(/what happened/);
    state.answers.voiceNoteFileId = 'v1';
    expect(validateStep('story', state)).toBeNull();
    state.answers.voiceNoteFileId = undefined;
    state.files = [
      {
        id: 'v1',
        slot: 'voice-note',
        name: 'v.webm',
        size: 9,
        mimeType: 'audio/webm',
        uploadedAt: 'now',
      },
    ];
    expect(validateStep('story', state)).toBeNull();
  });

  it('requires a situation, and a named person or a note', () => {
    const state = filled();
    state.answers.situations = [];
    expect(validateStep('situations', state)).toMatch(/Pick at least one/);
    state.answers.parties = [{ name: '  ', role: 'trustee' }];
    expect(validateStep('parties', state)).toMatch(/at least one name/);
    state.answers.partiesNote = 'My brother and his lawyer.';
    expect(validateStep('parties', state)).toBeNull();
  });

  it('never blocks the optional screens', () => {
    const state = filled();
    state.evaluation = {
      ...withModules,
      modules: [{ id: 'a', type: 'short_text', label: 'A', why: 'w', required: true }],
    };
    for (const step of ['documents', 'scope', 'follow-up', 'review'] as const)
      expect(validateStep(step, state)).toBeNull();
  });
});

describe('isAnswered', () => {
  const make = (type: FollowUpModule['type']): FollowUpModule =>
    ({
      id: 'm',
      type,
      label: 'L',
      why: 'w',
      required: true,
      options: [],
      multi: true,
      multiple: true,
      title: 't',
      body: 'b',
    }) as unknown as FollowUpModule;

  it('treats info as always answered and empties as unanswered', () => {
    expect(isAnswered(make('info'), undefined)).toBe(true);
    expect(isAnswered(make('short_text'), undefined)).toBe(false);
    expect(isAnswered(make('short_text'), null)).toBe(false);
    expect(isAnswered(make('short_text'), '  ')).toBe(false);
    expect(isAnswered(make('short_text'), 'x')).toBe(true);
    expect(isAnswered(make('choice'), [])).toBe(false);
    expect(isAnswered(make('upload'), ['f1'])).toBe(true);
    expect(isAnswered(make('yes_no'), false)).toBe(true);
  });
});

describe('persistence', () => {
  it('round-trips the whole state through storage, tiles and readings included', () => {
    const storage = fakeStorage();
    const state = filled();
    state.session = { id: 'i1', token: 't', status: 'draft', reference: 'RL-1' };
    state.step = 'situations';
    state.storyRead = {
      situations: ['trust-contests'],
      whatWeUnderstood: 'w',
      parties: [],
      documents: [],
    };
    state.storyReadFor = 'My father died and the trust changed.|';
    saveState(state, storage);
    expect(loadState(storage)).toEqual(state);
    clearState(storage);
    expect(loadState(storage)).toBeNull();
  });

  it('drops a version 1 draft (the old step order) and anything malformed', () => {
    const storage = fakeStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), version: 1, step: 'parties' }));
    expect(loadState(storage)).toBeNull();
    storage.setItem(STORAGE_KEY, '{not json');
    expect(loadState(storage)).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, step: 'story' }));
    expect(loadState(storage)).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), step: 'nowhere' }));
    expect(loadState(storage)).toBeNull();
  });

  it('fills defaults for fields a thinner draft lacks', () => {
    const storage = fakeStorage();
    const partial = {
      ...emptyState(),
      storyReadFor: undefined,
      answers: { contact: { fullName: 'J' } },
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(partial));
    const loaded = loadState(storage);
    expect(loaded?.storyReadFor).toBeNull();
    expect(loaded?.startTile).toBe(0);
    expect(loaded?.answers.contact).toEqual({ fullName: 'J', email: '', replyBy: 'email' });
    expect(loaded?.answers.situations).toEqual([]);
  });

  it('never throws when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(loadState(broken)).toBeNull();
    expect(() => saveState(emptyState(), broken)).not.toThrow();
    expect(() => clearState(broken)).not.toThrow();
  });
});
