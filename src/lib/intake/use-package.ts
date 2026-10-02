'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, getPackage, type Session } from './api';
import { readyPackage, type ReadyPackage } from './package';

/**
 * `checking` until the first answer and `unavailable` for good both render
 * nothing; `slow` is the 15-minute cap after the server said `preparing`.
 */
export type PackagePhase = 'checking' | 'preparing' | 'ready' | 'slow' | 'unavailable';

export interface PackageView {
  phase: PackagePhase;
  ready: ReadyPackage | null;
}

/** The view plus `afterDownload`, which the card calls when the button is pressed. */
export interface PackageController extends PackageView {
  afterDownload(): void;
}

export const PACKAGE_POLL_INTERVAL_MS = 5000;
export const PACKAGE_POLL_TIMEOUT_MS = 15 * 60_000;
/**
 * Every link works once and the button's lasts 15 minutes (package security,
 * 2026-10-02), so a ready card asks for a fresh one: this long after a press
 * (the download has started by then), a minute before the link runs out, and
 * whenever the page comes back into view. A failed ask is tried again once.
 */
export const PACKAGE_REFRESH_AFTER_DOWNLOAD_MS = 1500;
export const PACKAGE_REFRESH_BEFORE_EXPIRY_MS = 60_000;
export const PACKAGE_REFRESH_RETRY_MS = 5000;
/** sessionStorage: when this tab started waiting for this request's package. */
export const PACKAGE_STARTED_KEY = 'rl-intake-package';

const CHECKING: PackageView = { phase: 'checking', ready: null };
const UNAVAILABLE: PackageView = { phase: 'unavailable', ready: null };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isWaitRecord(value: unknown): value is { id: string; at: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { at?: unknown }).at === 'number'
  );
}

/**
 * The cap runs from the first wait in this tab, keyed to the request, so a
 * refresh resumes the same 15 minutes instead of starting a fresh one.
 */
export function waitStartedAt(id: string, now: number): number {
  try {
    const raw = sessionStorage.getItem(PACKAGE_STARTED_KEY);
    const saved: unknown = raw ? JSON.parse(raw) : null;
    if (isWaitRecord(saved) && saved.id === id && saved.at <= now) return saved.at;
    sessionStorage.setItem(PACKAGE_STARTED_KEY, JSON.stringify({ id, at: now }));
  } catch {
    // Private mode or no storage: the cap runs from this page load.
  }
  return now;
}

/** A refused request (gone, not ours, no such endpoint) ends the wait; a blip or a busy server does not. */
function isFinal(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status >= 400 && error.status < 500 && error.status !== 429;
}

interface PollOptions {
  session: Session;
  startedAt: number;
  stopped(): boolean;
  show(view: PackageView): void;
}

/** Asks every 5 seconds until the package is ready, the server says no, or the cap passes. */
async function pollPackage({ session, startedAt, stopped, show }: PollOptions): Promise<void> {
  let seenPreparing = false;
  while (!stopped()) {
    try {
      const response = await getPackage(session);
      if (stopped()) return;
      const ready = readyPackage(response);
      if (ready) return show({ phase: 'ready', ready });
      if (response.status !== 'preparing') return show(UNAVAILABLE);
      seenPreparing = true;
      show({ phase: 'preparing', ready: null });
    } catch (error) {
      if (stopped()) return;
      if (isFinal(error)) return show(UNAVAILABLE);
    }
    if (Date.now() - startedAt >= PACKAGE_POLL_TIMEOUT_MS)
      return show(seenPreparing ? { phase: 'slow', ready: null } : UNAVAILABLE);
    await sleep(PACKAGE_POLL_INTERVAL_MS);
  }
}

type Show = (view: PackageView) => void;

/** One ask for a fresh link while the card is ready; a second ask while one is out is dropped. */
function useRefresh(id: string | undefined, token: string | undefined, show: Show) {
  const busy = useRef(false);
  const refresh = useCallback(
    async (retry = true): Promise<void> => {
      if (!id || !token || busy.current) return;
      busy.current = true;
      try {
        const response = await getPackage({ id, token });
        const ready = readyPackage(response);
        if (ready) show({ phase: 'ready', ready });
        else if (response.status === 'unavailable') show(UNAVAILABLE);
      } catch (error) {
        if (isFinal(error)) show(UNAVAILABLE);
        else if (retry) setTimeout(() => void refresh(false), PACKAGE_REFRESH_RETRY_MS);
      } finally {
        busy.current = false;
      }
    },
    [id, token, show],
  );
  return refresh;
}

/** While ready: a fresh link when the page regains focus or comes back into view, and before the link runs out. */
function useFreshLink(view: PackageView, refresh: () => Promise<void>): void {
  const ready = view.phase === 'ready';
  const urlExpiresAt = view.ready?.urlExpiresAt ?? '';
  useEffect(() => {
    if (!ready) return;
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, refresh]);
  useEffect(() => {
    const at = Date.parse(urlExpiresAt);
    if (!ready || Number.isNaN(at)) return;
    const timer = setTimeout(
      () => void refresh(),
      Math.max(0, at - Date.now() - PACKAGE_REFRESH_BEFORE_EXPIRY_MS),
    );
    return () => clearTimeout(timer);
  }, [ready, urlExpiresAt, refresh]);
}

/**
 * The done screen's package: polls `GET /:id/package` for the request just
 * sent, then keeps the button's one-use link fresh (package security).
 */
export function usePackage(session: Session | null): PackageController {
  const [view, setView] = useState<PackageView>(CHECKING);
  const id = session?.id;
  const token = session?.token;

  useEffect(() => {
    if (!id || !token) return;
    let stopped = false;
    setView(CHECKING);
    void pollPackage({
      session: { id, token },
      startedAt: waitStartedAt(id, Date.now()),
      stopped: () => stopped,
      show: (next) => {
        if (!stopped) setView(next);
      },
    });
    return () => {
      stopped = true;
    };
  }, [id, token]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const show = useCallback<Show>((next) => {
    if (mounted.current) setView(next);
  }, []);
  const refresh = useRefresh(id, token, show);
  useFreshLink(view, refresh);
  const afterDownload = useCallback(() => {
    setTimeout(() => void refresh(), PACKAGE_REFRESH_AFTER_DOWNLOAD_MS);
  }, [refresh]);

  return { ...(id && token ? view : UNAVAILABLE), afterDownload };
}
