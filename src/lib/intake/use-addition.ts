'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ApiError, errorMessage } from './api-core';
import {
  getAddition,
  lookupAddition,
  openAddition,
  saveAdditionNote,
  sendAddition,
} from './api-add';
import {
  ADD_IDLE,
  ADD_STORAGE_KEY,
  addReducer,
  openFailure,
  parseStoredAdd,
  readAdditionToken,
  sendProblem,
  type AddAction,
  type AddState,
  type StoredAdd,
} from './add-state';
import { ADDITION_TOKEN_PARAM, type AdditionSession } from './contract';
import { ADD_ASK_COPY } from './copy';
import type { SaveStatus } from './use-intake';
import { isValidEmail } from './validate';

const NOTE_SAVE_DELAY_MS = 800;

/** sessionStorage can throw (private windows, blocked storage); the page works without it. */
const storage = {
  read(): StoredAdd | null {
    try {
      return parseStoredAdd(window.sessionStorage.getItem(ADD_STORAGE_KEY));
    } catch {
      return null;
    }
  },
  write(value: StoredAdd): void {
    try {
      window.sessionStorage.setItem(ADD_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* the page still works; a refresh asks for a new link */
    }
  },
  clear(): void {
    try {
      window.sessionStorage.removeItem(ADD_STORAGE_KEY);
    } catch {
      /* nothing stored, or storage blocked */
    }
  },
};

/** Takes the token out of the address bar so a refresh never tries to spend a used link. */
function stripToken(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(ADDITION_TOKEN_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
}

export interface AdditionController {
  state: AddState;
  saveStatus: SaveStatus;
  dispatch(action: AddAction): void;
  ask(email: string): Promise<void>;
  /** Tries the emailed link (or the restore) again after a lost connection. */
  retry(): void;
  setNote(note: string): void;
  send(uploading: number): Promise<void>;
  startAgain(): void;
}

/** Note autosave: debounced, and flushed before Send so the server sends the words on screen. */
function useNoteSave(addition: AdditionSession | null) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (): Promise<void> => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const note = pending.current;
    if (note === null || !addition) return;
    setSaveStatus('saving');
    try {
      await saveAdditionNote(addition, note);
      if (pending.current === note) pending.current = null;
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }
  }, [addition]);

  const schedule = useCallback(
    (note: string) => {
      pending.current = note;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush().catch(() => undefined), NOTE_SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return { saveStatus, schedule, flush };
}

type Dispatch = (action: AddAction) => void;

/** Opens the emailed link; the session goes to sessionStorage so a refresh keeps the page. */
async function openWith(token: string, dispatch: Dispatch): Promise<void> {
  dispatch({ type: 'opening' });
  try {
    const { addition } = await openAddition(token);
    storage.write({ v: 1, addition });
    dispatch({ type: 'opened', addition });
  } catch (error) {
    dispatch(openFailure(error));
  }
}

/** After a refresh: the note and files from the server. A dead bearer (sent elsewhere, or expired) forgets it. */
async function restoreWith(addition: AdditionSession, dispatch: Dispatch): Promise<void> {
  dispatch({ type: 'restoring' });
  try {
    dispatch({ type: 'opened', addition, state: await getAddition(addition) });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      storage.clear();
      dispatch({ type: 'ask-again' });
      return;
    }
    dispatch(openFailure(error));
  }
}

/**
 * A failed Send: reload what the server holds so the person can check the
 * list, and show its message. `keepNote` when the note itself could not be
 * saved: the words on screen are then newer than the server's and stay.
 */
async function reloadAfterFailure(
  addition: AdditionSession,
  error: unknown,
  dispatch: Dispatch,
  keepNote: boolean,
): Promise<void> {
  const message = errorMessage(error);
  try {
    dispatch({ type: 'reloaded', state: await getAddition(addition), message, keepNote });
  } catch (reloadError) {
    if (reloadError instanceof ApiError && reloadError.status === 401) {
      storage.clear();
      dispatch({ type: 'expired' });
      return;
    }
    dispatch({ type: 'failed', message });
  }
}

/**
 * After hydration, once: an emailed `?t=` link is spent (and taken out of the
 * address bar); otherwise a session kept from before a refresh is restored,
 * or the done screen shown again. Returns what "Try again" re-runs.
 */
function useStartFromAddress(dispatch: Dispatch) {
  const retryWith = useRef<(() => void) | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = readAdditionToken(window.location.search);
    if (token) {
      stripToken();
      retryWith.current = () => void openWith(token, dispatch);
      void openWith(token, dispatch);
      return;
    }
    const stored = storage.read();
    if (stored && 'done' in stored) dispatch({ type: 'sent', result: stored.done });
    else if (stored) {
      retryWith.current = () => void restoreWith(stored.addition, dispatch);
      void restoreWith(stored.addition, dispatch);
    }
  }, [dispatch]);
  return retryWith;
}

/** The page's whole controller: the emailed link, the restore, the note autosave, and Send. */
export function useAddition(): AdditionController {
  const [state, dispatch] = useReducer(addReducer, ADD_IDLE);
  const { saveStatus, schedule, flush } = useNoteSave(state.addition);
  const retryWith = useStartFromAddress(dispatch);

  const ask = useCallback(async (email: string) => {
    if (!isValidEmail(email)) {
      dispatch({ type: 'error', message: ADD_ASK_COPY.invalidEmail });
      return;
    }
    dispatch({ type: 'asking' });
    try {
      await lookupAddition(email.trim().toLowerCase());
      dispatch({ type: 'asked' });
    } catch (error) {
      dispatch({ type: 'failed', message: errorMessage(error) });
    }
  }, []);

  const setNote = useCallback(
    (note: string) => {
      dispatch({ type: 'note', note });
      schedule(note);
    },
    [schedule],
  );

  const send = useSend(state, flush, dispatch);
  const retry = useCallback(() => retryWith.current?.(), [retryWith]);
  const startAgain = useCallback(() => {
    storage.clear();
    dispatch({ type: 'ask-again' });
  }, []);
  return { state, saveStatus, dispatch, ask, retry, setNote, send, startAgain };
}

/** Send: the note saved first, then the file ids the page lists; on any failure the list is reloaded. */
function useSend(state: AddState, flush: () => Promise<void>, dispatch: Dispatch) {
  return useCallback(
    async (uploading: number) => {
      const { addition } = state;
      const problem = sendProblem(state, uploading);
      if (problem || !addition) {
        dispatch({ type: 'error', message: problem });
        return;
      }
      dispatch({ type: 'sending' });
      try {
        await flush();
      } catch (error) {
        await reloadAfterFailure(addition, error, dispatch, true);
        return;
      }
      try {
        const sent = await sendAddition(
          addition,
          state.files.map((f) => f.id),
        );
        const result = {
          reference: sent.reference,
          files: sent.files,
          withNote: Boolean(state.note.trim()),
        };
        storage.write({ v: 1, done: result });
        dispatch({ type: 'sent', result });
      } catch (error) {
        await reloadAfterFailure(addition, error, dispatch, false);
      }
    },
    [state, flush, dispatch],
  );
}
