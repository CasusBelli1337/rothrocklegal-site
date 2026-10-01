// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIntake } from './api';
import { emptyState, saveState } from './state';
import { useIntake } from './use-intake';

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  createIntake: vi.fn(),
  saveAnswers: vi.fn(() => Promise.resolve()),
}));

const SESSION = { id: 's1', token: 't1', status: 'draft', reference: 'RL-2026-000999' } as const;

/** A visitor on the third start tile with all three statements agreed to. */
function onLastStartTile() {
  saveState({ ...emptyState(), startTile: 2, acks: [true, true, true] });
}

let gtag: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  gtag = vi.fn();
  (window as Window & { gtag?: unknown }).gtag = gtag;
});

afterEach(() => {
  cleanup();
  vi.mocked(createIntake).mockReset();
  delete (window as Window & { gtag?: unknown }).gtag;
});

describe('useIntake Start', () => {
  it('counts consult_started once the session exists, with nothing attached', async () => {
    vi.mocked(createIntake).mockResolvedValue(SESSION);
    onLastStartTile();
    const { result } = renderHook(() => useIntake());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.next());
    expect(result.current.state.session).toEqual(SESSION);
    expect(gtag.mock.calls).toEqual([['event', 'consult_started']]);
  });

  it('counts nothing when the session cannot be created', async () => {
    vi.mocked(createIntake).mockRejectedValue(new Error('offline'));
    onLastStartTile();
    const { result } = renderHook(() => useIntake());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.next());
    expect(result.current.state.session).toBeNull();
    expect(gtag).not.toHaveBeenCalled();
  });
});
