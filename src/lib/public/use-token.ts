'use client';

import { useEffect, useState } from 'react';
import { isWellFormedToken, readToken } from './api';

export type TokenState = { status: 'pending' } | { status: 'missing' } | { status: 'ok'; token: string };

/**
 * The `?t=` token, read after hydration (the pages are static HTML, so the
 * server never sees it). A malformed value counts as missing without a request.
 */
export function useToken(): TokenState {
  const [state, setState] = useState<TokenState>({ status: 'pending' });
  useEffect(() => {
    const token = readToken(window.location.search);
    setState(token && isWellFormedToken(token) ? { status: 'ok', token } : { status: 'missing' });
  }, []);
  return state;
}
