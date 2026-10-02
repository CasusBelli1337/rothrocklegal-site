// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from './api';
import type { PackageResponse } from './contract';
import {
  PACKAGE_POLL_INTERVAL_MS,
  PACKAGE_POLL_TIMEOUT_MS,
  PACKAGE_REFRESH_AFTER_DOWNLOAD_MS,
  PACKAGE_REFRESH_BEFORE_EXPIRY_MS,
  PACKAGE_REFRESH_RETRY_MS,
  PACKAGE_STARTED_KEY,
  usePackage,
} from './use-package';

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  getPackage: vi.fn(),
}));

const getPackage = vi.mocked(api.getPackage);
const session = { id: 'in_1', token: 'secret-token' };
const PREPARING: PackageResponse = { status: 'preparing' };
const READY: PackageResponse = {
  status: 'ready',
  url: 'https://intake.example/package/abc.zip',
  expiresAt: '2026-10-15T19:00:00.000Z',
  sizeBytes: 13_002_342,
  fileCount: 9,
};
/** A ready answer whose one-use link lasts 15 minutes from now (fake clock), numbered so a test can tell them apart. */
const readyLink = (n: number): PackageResponse => ({
  ...READY,
  url: `https://intake.example/api/intake/package/link-${n}`,
  urlExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
});

/** Lets the pending fetch settle and the loop reach its next sleep. */
const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  getPackage.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('usePackage', () => {
  it('shows preparing, asks again every 5 seconds, then stops at ready', async () => {
    getPackage
      .mockResolvedValueOnce(PREPARING)
      .mockResolvedValueOnce(PREPARING)
      .mockResolvedValueOnce(READY);
    const { result } = renderHook(() => usePackage(session));
    expect(result.current.phase).toBe('checking');

    await flush();
    expect(result.current.phase).toBe('preparing');
    expect(getPackage).toHaveBeenCalledTimes(1);
    expect(getPackage).toHaveBeenCalledWith(session);

    await wait(PACKAGE_POLL_INTERVAL_MS - 1);
    expect(getPackage).toHaveBeenCalledTimes(1);
    await wait(1);
    expect(getPackage).toHaveBeenCalledTimes(2);
    expect(result.current.phase).toBe('preparing');

    await wait(PACKAGE_POLL_INTERVAL_MS);
    expect(result.current.phase).toBe('ready');
    expect(result.current.ready?.url).toBe(READY.url);

    await wait(60_000);
    expect(getPackage).toHaveBeenCalledTimes(3);
  });

  it('gives up after 15 minutes of preparing and says the link comes by email', async () => {
    getPackage.mockResolvedValue(PREPARING);
    const { result } = renderHook(() => usePackage(session));
    await flush();
    await wait(PACKAGE_POLL_TIMEOUT_MS - PACKAGE_POLL_INTERVAL_MS);
    expect(result.current.phase).toBe('preparing');
    await wait(PACKAGE_POLL_INTERVAL_MS);
    expect(result.current.phase).toBe('slow');
    const calls = getPackage.mock.calls.length;
    expect(calls).toBe(PACKAGE_POLL_TIMEOUT_MS / PACKAGE_POLL_INTERVAL_MS + 1);
    await wait(60_000);
    expect(getPackage).toHaveBeenCalledTimes(calls);
  });

  it('shows nothing, and stops asking, when the server has no package', async () => {
    getPackage.mockResolvedValue({ status: 'unavailable' });
    const { result } = renderHook(() => usePackage(session));
    await flush();
    expect(result.current).toMatchObject({ phase: 'unavailable', ready: null });
    await wait(60_000);
    expect(getPackage).toHaveBeenCalledTimes(1);
  });

  it('shows nothing for a ready answer with no usable link', async () => {
    getPackage.mockResolvedValue({ status: 'ready', url: 'javascript:alert(1)' });
    const { result } = renderHook(() => usePackage(session));
    await flush();
    expect(result.current.phase).toBe('unavailable');
  });

  it('treats a refused request (404, no such endpoint) as nothing to show', async () => {
    getPackage.mockRejectedValue(new api.ApiError('Not found.', 'not-found', 404));
    const { result } = renderHook(() => usePackage(session));
    await flush();
    expect(result.current.phase).toBe('unavailable');
    await wait(60_000);
    expect(getPackage).toHaveBeenCalledTimes(1);
  });

  it('rides out a lost connection or a busy server', async () => {
    getPackage
      .mockRejectedValueOnce(new api.ApiError('offline', 'network', 0))
      .mockRejectedValueOnce(new api.ApiError('busy', 'server-error', 503))
      .mockResolvedValueOnce(READY);
    const { result } = renderHook(() => usePackage(session));
    await flush();
    expect(result.current.phase).toBe('checking');
    await wait(2 * PACKAGE_POLL_INTERVAL_MS);
    expect(result.current.phase).toBe('ready');
  });

  it('shows nothing when the server never answered before the cap', async () => {
    getPackage.mockRejectedValue(new api.ApiError('busy', 'server-error', 500));
    const { result } = renderHook(() => usePackage(session));
    await wait(PACKAGE_POLL_TIMEOUT_MS);
    expect(result.current.phase).toBe('unavailable');
  });

  it('keeps the 15 minutes across a refresh of the same request', async () => {
    sessionStorage.setItem(
      PACKAGE_STARTED_KEY,
      JSON.stringify({ id: 'in_1', at: Date.now() - (PACKAGE_POLL_TIMEOUT_MS - 10_000) }),
    );
    getPackage.mockResolvedValue(PREPARING);
    const { result } = renderHook(() => usePackage(session));
    await flush();
    expect(result.current.phase).toBe('preparing');
    await wait(10_000);
    expect(result.current.phase).toBe('slow');
  });

  it('starts a fresh 15 minutes for a different request', async () => {
    sessionStorage.setItem(
      PACKAGE_STARTED_KEY,
      JSON.stringify({ id: 'in_old', at: Date.now() - PACKAGE_POLL_TIMEOUT_MS * 2 }),
    );
    getPackage.mockResolvedValue(PREPARING);
    const { result } = renderHook(() => usePackage(session));
    await wait(60_000);
    expect(result.current.phase).toBe('preparing');
    expect(JSON.parse(sessionStorage.getItem(PACKAGE_STARTED_KEY) ?? '{}').id).toBe('in_1');
  });

  it('stops asking once the screen goes away', async () => {
    getPackage.mockResolvedValue(PREPARING);
    const { unmount } = renderHook(() => usePackage(session));
    await flush();
    unmount();
    await wait(60_000);
    expect(getPackage).toHaveBeenCalledTimes(1);
  });

  it('asks nothing without a session', async () => {
    const { result } = renderHook(() => usePackage(null));
    await wait(60_000);
    expect(result.current.phase).toBe('unavailable');
    expect(getPackage).not.toHaveBeenCalled();
  });

  describe('once ready, keeps the one-use link fresh', () => {
    it('asks again when the window regains focus or the page comes back into view, not while hidden', async () => {
      getPackage.mockResolvedValueOnce(readyLink(1)).mockResolvedValueOnce(readyLink(2)).mockResolvedValueOnce(readyLink(3));
      const { result } = renderHook(() => usePackage(session));
      await flush();
      expect(result.current.ready?.url).toMatch(/link-1$/);
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });
      await flush();
      expect(result.current.ready?.url).toMatch(/link-2$/);
      const hidden = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await flush();
      expect(getPackage).toHaveBeenCalledTimes(2);
      hidden.mockReturnValue('visible');
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await flush();
      expect(result.current.ready?.url).toMatch(/link-3$/);
      hidden.mockRestore();
    });

    it('asks again shortly after a download press, and a minute before the link runs out', async () => {
      // Each link's 15 minutes run from the moment the server answers.
      for (const n of [1, 2, 3]) getPackage.mockImplementationOnce(async () => readyLink(n));
      const { result } = renderHook(() => usePackage(session));
      await flush();
      act(() => result.current.afterDownload());
      await wait(PACKAGE_REFRESH_AFTER_DOWNLOAD_MS - 1);
      expect(getPackage).toHaveBeenCalledTimes(1);
      await wait(1);
      expect(result.current.ready?.url).toMatch(/link-2$/);
      await wait(15 * 60_000 - PACKAGE_REFRESH_BEFORE_EXPIRY_MS - 1);
      expect(getPackage).toHaveBeenCalledTimes(2);
      await wait(1);
      expect(result.current.ready?.url).toMatch(/link-3$/);
    });

    it('keeps the link it has through a blip and tries once more; drops the card when the package ran out', async () => {
      getPackage
        .mockResolvedValueOnce(readyLink(1))
        .mockRejectedValueOnce(new api.ApiError('offline', 'network', 0))
        .mockResolvedValueOnce(readyLink(2))
        .mockResolvedValueOnce({ status: 'unavailable' });
      const { result } = renderHook(() => usePackage(session));
      await flush();
      act(() => result.current.afterDownload());
      await wait(PACKAGE_REFRESH_AFTER_DOWNLOAD_MS);
      expect(result.current.ready?.url).toMatch(/link-1$/);
      await wait(PACKAGE_REFRESH_RETRY_MS);
      expect(result.current.ready?.url).toMatch(/link-2$/);
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });
      await flush();
      expect(result.current.phase).toBe('unavailable');
    });

    it('asks once when focus and visibility arrive together', async () => {
      let answer: (value: PackageResponse) => void = () => undefined;
      getPackage
        .mockResolvedValueOnce(readyLink(1))
        .mockReturnValueOnce(new Promise<PackageResponse>((resolve) => (answer = resolve)));
      const { result } = renderHook(() => usePackage(session));
      await flush();
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(getPackage).toHaveBeenCalledTimes(2);
      await act(async () => answer(readyLink(2)));
      expect(result.current.ready?.url).toMatch(/link-2$/);
    });
  });
});
