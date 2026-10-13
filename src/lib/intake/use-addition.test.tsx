// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAddition,
  lookupAddition,
  openAddition,
  saveAdditionNote,
  sendAddition,
} from './api-add';
import { ApiError } from './api-core';
import { ADD_STORAGE_KEY } from './add-state';
import type { AdditionSession, IntakeFile } from './contract';
import { useAddition } from './use-addition';

vi.mock('./api-add', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api-add')>()),
  lookupAddition: vi.fn(() => Promise.resolve()),
  openAddition: vi.fn(),
  getAddition: vi.fn(),
  saveAdditionNote: vi.fn(() => Promise.resolve()),
  sendAddition: vi.fn(),
}));

const SESSION: AdditionSession = {
  id: 'add_1',
  token: 'bearer-1',
  reference: 'RL-2026-000123',
  sentAt: '2026-10-01T18:30:00.000Z',
  expiresAt: '2099-01-01T00:00:00.000Z',
};
const FILE: IntakeFile = {
  id: 'f1',
  slot: 'documents',
  name: 'deed.pdf',
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: '2026-10-13T18:00:00.000Z',
};

function at(search: string) {
  window.history.replaceState(null, '', `/request-a-consult/add/${search}`);
}

const stored = () => JSON.parse(window.sessionStorage.getItem(ADD_STORAGE_KEY) ?? 'null');

beforeEach(() => {
  window.sessionStorage.clear();
  at('');
});

afterEach(() => {
  cleanup();
  vi.mocked(openAddition).mockReset();
  vi.mocked(getAddition).mockReset();
  vi.mocked(sendAddition).mockReset();
  vi.mocked(lookupAddition).mockClear();
  vi.mocked(saveAdditionNote).mockClear();
});

describe('useAddition', () => {
  it('asks with the address and shows the card whatever the server found', async () => {
    const { result } = renderHook(() => useAddition());
    await act(() => result.current.ask('not-an-email'));
    expect(result.current.state.error).toBeTruthy();
    expect(lookupAddition).not.toHaveBeenCalled();
    await act(() => result.current.ask(' Maria@Example.test '));
    expect(lookupAddition).toHaveBeenCalledWith('maria@example.test');
    expect(result.current.state.phase).toBe('asked');
  });

  it('spends ?t= once, strips it from the address, and keeps the session for a refresh', async () => {
    vi.mocked(openAddition).mockResolvedValue({ addition: SESSION });
    at('?t=tok123');
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.phase).toBe('open'));
    expect(openAddition).toHaveBeenCalledWith('tok123');
    expect(window.location.search).toBe('');
    expect(stored()).toEqual({ v: 1, addition: SESSION });
  });

  it('shows the email form with a notice when the link was spent', async () => {
    vi.mocked(openAddition).mockRejectedValue(new ApiError('used', 'unauthorized', 401));
    at('?t=tok123');
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.expired).toBe(true));
    expect(result.current.state.phase).toBe('ask');
  });

  it('restores a stored addition from the server after a refresh, and forgets a dead one', async () => {
    window.sessionStorage.setItem(ADD_STORAGE_KEY, JSON.stringify({ v: 1, addition: SESSION }));
    vi.mocked(getAddition).mockResolvedValue({ ...SESSION, note: 'kept', files: [FILE] });
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.phase).toBe('open'));
    expect(result.current.state).toMatchObject({ note: 'kept', files: [FILE] });
    cleanup();

    vi.mocked(getAddition).mockRejectedValue(new ApiError('gone', 'unauthorized', 401));
    const again = renderHook(() => useAddition());
    await waitFor(() => expect(stored()).toBeNull());
    expect(again.result.current.state.phase).toBe('ask');
  });

  it('saves the note before Send, sends the listed file ids, and remembers done', async () => {
    window.sessionStorage.setItem(ADD_STORAGE_KEY, JSON.stringify({ v: 1, addition: SESSION }));
    vi.mocked(getAddition).mockResolvedValue({ ...SESSION, note: '', files: [FILE] });
    vi.mocked(sendAddition).mockResolvedValue({
      reference: SESSION.reference,
      sent: true,
      files: 1,
      nextSteps: 'x',
    });
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.phase).toBe('open'));
    act(() => result.current.setNote('the deed came in the mail'));
    await act(() => result.current.send(0));
    expect(saveAdditionNote).toHaveBeenCalledWith(SESSION, 'the deed came in the mail');
    expect(sendAddition).toHaveBeenCalledWith(SESSION, ['f1']);
    expect(result.current.state).toMatchObject({
      phase: 'done',
      result: { reference: SESSION.reference, files: 1, withNote: true },
    });
    expect(stored()).toEqual({
      v: 1,
      done: { reference: SESSION.reference, files: 1, withNote: true },
    });
  });

  it('on a failed Send reloads the list from the server and shows its message', async () => {
    window.sessionStorage.setItem(ADD_STORAGE_KEY, JSON.stringify({ v: 1, addition: SESSION }));
    vi.mocked(getAddition)
      .mockResolvedValueOnce({ ...SESSION, note: 'n', files: [] })
      .mockResolvedValueOnce({ ...SESSION, note: 'n', files: [FILE] });
    vi.mocked(sendAddition).mockRejectedValue(
      new ApiError('The list changed. Check it and send again.', 'bad-request', 400),
    );
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.phase).toBe('open'));
    await act(() => result.current.send(0));
    expect(getAddition).toHaveBeenCalledTimes(2);
    expect(result.current.state).toMatchObject({
      phase: 'open',
      busy: false,
      files: [FILE],
      error: 'The list changed. Check it and send again.',
    });
  });

  it('refuses Send with nothing to add or while files are uploading', async () => {
    vi.mocked(openAddition).mockResolvedValue({ addition: SESSION });
    at('?t=tok123');
    const { result } = renderHook(() => useAddition());
    await waitFor(() => expect(result.current.state.phase).toBe('open'));
    await act(() => result.current.send(0));
    expect(result.current.state.error).toBe('Add a note or a file first.');
    act(() => result.current.setNote('x'));
    await act(() => result.current.send(2));
    expect(result.current.state.error).toBe('Please wait for your files to finish uploading.');
    expect(sendAddition).not.toHaveBeenCalled();
  });
});
