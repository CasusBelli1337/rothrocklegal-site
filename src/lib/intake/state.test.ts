import { describe, expect, it } from 'vitest';
import type { FollowUpModule } from './contract';
import {
  STORAGE_KEY,
  canGoBack,
  clearState,
  emptyState,
  isAnswered,
  loadState,
  mergeAnswers,
  nextStep,
  prevStep,
  saveState,
  stepNumber,
  validateStep,
  type IntakeState,
} from './state';

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

function filled(): IntakeState {
  const state = emptyState();
  state.acks = [true, true, true];
  state.answers.contact = { fullName: 'Jane Doe', email: 'jane@example.com', replyBy: 'email' };
  state.answers.situations = ['trust-contests'];
  state.answers.parties = [{ name: 'John Doe', role: 'decedent' }];
  state.answers.story = 'My father died and the trust changed.';
  return state;
}

describe('step machine', () => {
  it('numbers the eight middle screens only', () => {
    expect(stepNumber('start')).toBeNull();
    expect(stepNumber('contact')).toBe(1);
    expect(stepNumber('review')).toBe(7);
    expect(stepNumber('follow-up')).toBe(8);
    expect(stepNumber('done')).toBeNull();
  });

  it('moves forward and back inside the bounds', () => {
    expect(nextStep('start')).toBe('contact');
    expect(nextStep('done')).toBe('done');
    expect(prevStep('contact')).toBe('start');
    expect(prevStep('start')).toBe('start');
  });

  it('offers Back before the evaluation, never after', () => {
    expect(canGoBack('start')).toBe(false);
    expect(canGoBack('contact')).toBe(true);
    expect(canGoBack('review')).toBe(true);
    expect(canGoBack('follow-up')).toBe(false);
    expect(canGoBack('done')).toBe(false);
  });
});

describe('mergeAnswers', () => {
  it('deep-merges contact and keyDates and replaces arrays', () => {
    const base = filled().answers;
    const merged = mergeAnswers(base, {
      contact: { phone: '408' },
      keyDates: { dateOfDeath: '2026-01-02' },
      situations: ['will-contests'],
    });
    expect(merged.contact).toEqual({ ...base.contact, phone: '408' });
    expect(merged.keyDates).toEqual({ dateOfDeath: '2026-01-02' });
    expect(merged.situations).toEqual(['will-contests']);
    expect(merged.story).toBe(base.story);
  });
});

describe('validateStep', () => {
  it('requires all three acknowledgments to start', () => {
    const state = emptyState();
    expect(validateStep('start', state)).toMatch(/three boxes/);
    state.acks = [true, true, false];
    expect(validateStep('start', state)).toMatch(/three boxes/);
    state.acks = [true, true, true];
    expect(validateStep('start', state)).toBeNull();
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

  it('requires a situation, a named person, and a story', () => {
    const state = filled();
    state.answers.situations = [];
    expect(validateStep('situations', state)).toMatch(/Pick at least one/);
    state.answers.parties = [{ name: '  ', role: 'trustee' }];
    expect(validateStep('parties', state)).toMatch(/at least one name/);
    state.answers.story = '';
    expect(validateStep('story', state)).toMatch(/what happened/);
    expect(validateStep('documents', state)).toBeNull();
    expect(validateStep('scope', state)).toBeNull();
    expect(validateStep('review', state)).toBeNull();
  });

  it('blocks the follow-up only on unanswered required modules', () => {
    const state = filled();
    state.evaluation = {
      headline: 'h',
      whatWeUnderstood: 'w',
      modules: [
        { id: 'a', type: 'short_text', label: 'A', why: 'w', required: true },
        { id: 'b', type: 'yes_no', label: 'B', why: 'w', required: false },
      ],
    };
    expect(validateStep('follow-up', state)).toMatch(/required/);
    state.followUpAnswers = { a: 'answer', b: null };
    expect(validateStep('follow-up', state)).toBeNull();
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
  it('round-trips the whole state through storage', () => {
    const storage = fakeStorage();
    const state = filled();
    state.session = { id: 'i1', token: 't', status: 'draft', reference: 'RL-1' };
    state.step = 'story';
    saveState(state, storage);
    expect(loadState(storage)).toEqual(state);
    clearState(storage);
    expect(loadState(storage)).toBeNull();
  });

  it('ignores garbage and unknown shapes', () => {
    const storage = fakeStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    expect(loadState(storage)).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, step: 'story' }));
    expect(loadState(storage)).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), step: 'nowhere' }));
    expect(loadState(storage)).toBeNull();
  });

  it('fills defaults for fields an older draft lacks', () => {
    const storage = fakeStorage();
    const partial = {
      ...emptyState(),
      unsureDates: undefined,
      answers: { contact: { fullName: 'J' } },
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(partial));
    const loaded = loadState(storage);
    expect(loaded?.unsureDates).toEqual([]);
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
