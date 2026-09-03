'use client';

import { useCallback, useReducer, useRef } from 'react';
import { lookupEmail, type Session } from './api';
import { LOOKUP_IDLE, lookupReducer, normalizeEmail, type LookupState } from './resume';
import { isValidEmail } from './state';

export interface LookupController extends LookupState {
  /**
   * Asks the server about the address (once per address). Resolves true only
   * when the card has just appeared, so the caller pauses long enough for the
   * person to read it; every later call resolves false. The card and the pause
   * are the same whatever the server answered, so nothing on screen tells a
   * stranger whether the address has a request.
   */
  check(rawEmail: string): Promise<boolean>;
  dismiss(): void;
}

interface InFlight {
  email: string;
  promise: Promise<boolean>;
}

/** The contact step's "started before" card; the reducer in resume.ts holds the rules. */
export function useLookup(session: Session | null): LookupController {
  const [state, dispatch] = useReducer(lookupReducer, LOOKUP_IDLE);
  const current = useRef(state);
  current.current = state;
  const inFlight = useRef<InFlight | null>(null);

  const check = useCallback(
    async (rawEmail: string): Promise<boolean> => {
      const email = normalizeEmail(rawEmail);
      if (!isValidEmail(email)) return false;
      if (inFlight.current?.email === email) return inFlight.current.promise;
      const before = current.current;
      if (before.email === email && before.phase !== 'idle') return false;
      dispatch({ type: 'check', email });
      const promise = lookupEmail(email, session).then((found) => {
        dispatch({ type: 'result', email, found });
        if (inFlight.current?.email === email) inFlight.current = null;
        return true;
      });
      inFlight.current = { email, promise };
      return promise;
    },
    [session],
  );

  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), []);
  return { ...state, check, dismiss };
}
