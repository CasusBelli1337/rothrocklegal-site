import { describe, expect, it } from 'vitest';
import { ApiError } from './api-core';
import {
  ADD_IDLE,
  addReducer,
  openFailure,
  parseStoredAdd,
  readAdditionToken,
  sendProblem,
  sentOnDate,
  type AddState,
} from './add-state';
import {
  ADDITION_RULES,
  type AdditionSession,
  type AdditionState,
  type IntakeFile,
} from './contract';
import { ADD_CLOSED_COPY, ADD_OPEN_COPY, UPLOAD_COPY } from './copy';

const SESSION: AdditionSession = {
  id: 'add_1',
  token: 'bearer-1',
  reference: 'RL-2026-000123',
  sentAt: '2026-10-01T18:30:00.000Z',
  expiresAt: '2026-10-14T18:30:00.000Z',
};

const file = (id: string): IntakeFile => ({
  id,
  slot: 'documents',
  name: `${id}.pdf`,
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: '2026-10-13T18:00:00.000Z',
});

const open = (patch: Partial<AddState> = {}): AddState => ({
  ...addReducer(ADD_IDLE, { type: 'opened', addition: SESSION }),
  ...patch,
});

describe('addReducer', () => {
  it('moves from the email form to the uniform card, and back', () => {
    const asking = addReducer(ADD_IDLE, { type: 'asking' });
    expect(asking.busy).toBe(true);
    const asked = addReducer(asking, { type: 'asked' });
    expect(asked).toMatchObject({ phase: 'asked', busy: false, error: null });
    expect(addReducer(asked, { type: 'ask-again' })).toEqual(ADD_IDLE);
  });

  it('opens an addition with an empty note, or restores the server copy after a refresh', () => {
    const fresh = addReducer(addReducer(ADD_IDLE, { type: 'opening' }), {
      type: 'opened',
      addition: SESSION,
    });
    expect(fresh).toMatchObject({
      phase: 'open',
      addition: SESSION,
      note: '',
      files: [],
      busy: false,
    });
    const server: AdditionState = {
      ...SESSION,
      note: 'the will is dated 2019',
      files: [file('f1')],
    };
    const restored = addReducer(addReducer(ADD_IDLE, { type: 'restoring' }), {
      type: 'opened',
      addition: SESSION,
      state: server,
    });
    expect(restored).toMatchObject({ note: 'the will is dated 2019', files: [file('f1')] });
  });

  it('shows the email form with a notice for a spent link, and the closed and limit screens', () => {
    expect(addReducer(open(), { type: 'expired' })).toMatchObject({
      phase: 'ask',
      expired: true,
      addition: null,
    });
    expect(addReducer(open(), { type: 'closed' }).phase).toBe('closed');
    const limit = addReducer(ADD_IDLE, { type: 'limit', message: 'Please wait until October 20.' });
    expect(limit).toMatchObject({ phase: 'limit', error: 'Please wait until October 20.' });
    expect(addReducer(ADD_IDLE, { type: 'limit', message: '' }).error).toBe(
      ADD_CLOSED_COPY.limitFallback,
    );
  });

  it('caps the note, keeps each file once, and removes a file', () => {
    const long = 'x'.repeat(ADDITION_RULES.maxNoteChars + 50);
    expect(addReducer(open(), { type: 'note', note: long }).note).toHaveLength(
      ADDITION_RULES.maxNoteChars,
    );
    const one = addReducer(open(), { type: 'file-added', file: file('f1') });
    expect(addReducer(one, { type: 'file-added', file: file('f1') }).files).toHaveLength(1);
    expect(addReducer(one, { type: 'file-removed', fileId: 'f1' }).files).toEqual([]);
  });

  it('after a failed Send takes the server list and its message; an unsaved note stays on screen', () => {
    const server: AdditionState = {
      ...SESSION,
      note: 'old words',
      files: [file('f1'), file('f2')],
    };
    const sending = addReducer(open({ note: 'new words', files: [file('f1')] }), {
      type: 'sending',
    });
    const reloaded = addReducer(sending, {
      type: 'reloaded',
      state: server,
      message: 'The list changed.',
    });
    expect(reloaded).toMatchObject({ busy: false, note: 'old words', error: 'The list changed.' });
    expect(reloaded.files.map((f) => f.id)).toEqual(['f1', 'f2']);
    const kept = addReducer(sending, {
      type: 'reloaded',
      state: server,
      message: 'x',
      keepNote: true,
    });
    expect(kept.note).toBe('new words');
  });

  it('lands on done and forgets the addition', () => {
    const result = { reference: 'RL-2026-000123', files: 2, withNote: true };
    expect(addReducer(open(), { type: 'sent', result })).toMatchObject({
      phase: 'done',
      addition: null,
      result,
    });
  });
});

describe('sendProblem', () => {
  it('waits for uploads on their way, then needs a note or a file', () => {
    expect(sendProblem(open({ note: 'x' }), 1)).toBe(UPLOAD_COPY.wait);
    expect(sendProblem(open({ note: '   ' }), 0)).toBe(ADD_OPEN_COPY.needSomething);
    expect(sendProblem(open({ note: 'a note alone is fine' }), 0)).toBeNull();
    expect(sendProblem(open({ files: [file('f1')] }), 0)).toBeNull();
  });
});

describe('openFailure', () => {
  it('maps 401, 400, and 429 to their screens, anything else to a retry with the message', () => {
    expect(openFailure(new ApiError('used', 'unauthorized', 401))).toEqual({ type: 'expired' });
    expect(openFailure(new ApiError('closed', 'bad-request', 400))).toEqual({ type: 'closed' });
    expect(openFailure(new ApiError('Wait a week.', 'rate-limited', 429))).toEqual({
      type: 'limit',
      message: 'Wait a week.',
    });
    expect(openFailure(new ApiError('offline', 'network', 0))).toEqual({
      type: 'failed',
      message: 'offline',
    });
  });
});

describe('the token and the stored session', () => {
  it('reads ?t= and ignores an empty one', () => {
    expect(readAdditionToken('?t=abc123')).toBe('abc123');
    expect(readAdditionToken('?t=%20')).toBeNull();
    expect(readAdditionToken('?resume=abc')).toBeNull();
  });

  it('keeps a live addition and a done marker; drops expired, malformed, and unknown values', () => {
    const now = Date.parse('2026-10-13T20:00:00.000Z');
    expect(parseStoredAdd(JSON.stringify({ v: 1, addition: SESSION }), now)).toEqual({
      v: 1,
      addition: SESSION,
    });
    const done = { reference: 'RL-2026-000123', files: 0, withNote: true };
    expect(parseStoredAdd(JSON.stringify({ v: 1, done }), now)).toEqual({ v: 1, done });
    const late = Date.parse('2026-10-15T00:00:00.000Z');
    expect(parseStoredAdd(JSON.stringify({ v: 1, addition: SESSION }), late)).toBeNull();
    expect(parseStoredAdd('{not json', now)).toBeNull();
    expect(parseStoredAdd(JSON.stringify({ v: 2, addition: SESSION }), now)).toBeNull();
    expect(parseStoredAdd(JSON.stringify({ v: 1, addition: { id: 'x' } }), now)).toBeNull();
    expect(parseStoredAdd(null, now)).toBeNull();
  });

  it('says the day the request was sent in the firm calendar', () => {
    expect(sentOnDate('2026-10-02T05:00:00.000Z')).toBe('October 1, 2026');
    expect(sentOnDate('nonsense')).toBeNull();
  });
});
