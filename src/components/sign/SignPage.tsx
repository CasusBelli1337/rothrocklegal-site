'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { LoadingCard, NoticeCard, SmallPrint } from '@/components/public/StateCards';
import { PublicShell } from '@/components/public/PublicShell';
import {
  PublicApiError,
  errorMessage,
  fetchEnvelope,
  isNotFound,
  signPdfUrl,
  submitSignature,
} from '@/lib/public/api';
import { SHARED_COPY, SIGN_COPY } from '@/lib/public/copy';
import {
  EMPTY_SIGNATURE,
  SIGN_INITIAL,
  buildSubmit,
  hasReadToEnd,
  signReducer,
  signatureProblem,
  type SignEvent,
  type SignatureInput,
} from '@/lib/public/sign-state';
import { useToken } from '@/lib/public/use-token';
import './sign.css';
import { PdfDocument } from './PdfDocument';
import { ReadIndicator } from './ReadIndicator';
import { SignDone } from './SignDone';
import { SignatureBlock } from './SignatureBlock';

/** How a failed signing request lands: a dead link, a race already won by an earlier click, or a plain error. */
function failureEvent(error: unknown): SignEvent {
  if (isNotFound(error)) return { type: 'invalid' };
  if (error instanceof PublicApiError && error.status === 409) return { type: 'already-signed' };
  return { type: 'submit-failed', message: errorMessage(error) };
}

/** Fetches the envelope once the token is known, and again after "Try again". */
function useEnvelope(token: string | null, loading: boolean, dispatch: React.Dispatch<SignEvent>) {
  useEffect(() => {
    if (!token || !loading) return;
    let alive = true;
    fetchEnvelope(token)
      .then((envelope) => alive && dispatch({ type: 'loaded', envelope }))
      .catch((error: unknown) => {
        if (!alive) return;
        dispatch(isNotFound(error) ? { type: 'invalid' } : { type: 'load-failed', message: errorMessage(error) });
      });
    return () => {
      alive = false;
    };
  }, [token, loading, dispatch]);
}

/** The /sign/ page: link check, the agreement, the read indicator, the signature block, the thank-you. */
export function SignPage() {
  const tokenState = useToken();
  const token = tokenState.status === 'ok' ? tokenState.token : null;
  const [state, dispatch] = useReducer(signReducer, SIGN_INITIAL);
  const [input, setInput] = useState<SignatureInput>(EMPTY_SIGNATURE);
  const [problem, setProblem] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const readToEnd = hasReadToEnd(state);

  useEffect(() => {
    if (tokenState.status === 'missing') dispatch({ type: 'invalid' });
  }, [tokenState.status]);
  useEnvelope(token, state.phase === 'loading', dispatch);
  useEffect(() => {
    const name = state.envelope?.signerName;
    if (name) setInput((current) => (current.typedName ? current : { ...current, typedName: name }));
  }, [state.envelope]);
  useEffect(() => {
    if (state.phase === 'done') headingRef.current?.focus();
  }, [state.phase]);

  const onOpened = useCallback((pages: number) => dispatch({ type: 'pdf-opened', pages }), []);
  const onPageSeen = useCallback((page: number) => dispatch({ type: 'page-seen', page }), []);
  const onPdfFailed = useCallback(() => undefined, []);

  const submit = async () => {
    if (!token) return;
    const found = signatureProblem(input, readToEnd);
    setProblem(found);
    if (found) return;
    dispatch({ type: 'submit' });
    try {
      const result = await submitSignature(token, buildSubmit(input));
      dispatch({ type: 'signed', result });
    } catch (error) {
      dispatch(failureEvent(error));
    }
  };

  const lead = state.envelope && (state.phase === 'ready' || state.phase === 'signing') && (
    <>
      <p>
        {SIGN_COPY.preparedFor} <strong className="text-ink">{state.envelope.signerName}</strong>.
      </p>
      <p className="text-body">{SIGN_COPY.intro}</p>
    </>
  );

  return (
    <PublicShell eyebrow={SIGN_COPY.eyebrow} title={SIGN_COPY.title} lead={lead} headingRef={headingRef}>
      {(state.phase === 'loading' || tokenState.status === 'pending') && (
        <LoadingCard text={SIGN_COPY.loading} />
      )}
      {state.phase === 'invalid' && (
        <NoticeCard tone="alert" title={SIGN_COPY.invalid.title} body={SIGN_COPY.invalid.body} />
      )}
      {state.phase === 'error' && (
        <NoticeCard
          tone="alert"
          title={SIGN_COPY.loadFailed}
          body={state.error ?? SHARED_COPY.generic}
          action={{ label: SHARED_COPY.tryAgain, onClick: () => dispatch({ type: 'retry' }) }}
        />
      )}
      {state.phase === 'already-signed' && (
        <NoticeCard tone="banner" title={SIGN_COPY.alreadySigned.title} body={SIGN_COPY.alreadySigned.body} />
      )}
      {(state.phase === 'ready' || state.phase === 'signing') && token && state.envelope && (
        <>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-h3 text-ink">{state.envelope.documentTitle}</h2>
            <p className="text-small text-ink-3 tabular">
              {state.pagesTotal} {state.pagesTotal === 1 ? 'page' : 'pages'}
            </p>
          </div>
          <PdfDocument
            url={signPdfUrl(token)}
            onOpened={onOpened}
            onPageSeen={onPageSeen}
            onFailed={onPdfFailed}
          />
          <ReadIndicator
            seen={state.pagesSeen}
            total={state.pagesTotal}
            readToEnd={readToEnd}
            onConfirm={() => dispatch({ type: 'confirm-read' })}
          />
          <SignatureBlock
            input={input}
            onChange={(patch) => {
              setProblem(null);
              setInput((current) => ({ ...current, ...patch }));
            }}
            readToEnd={readToEnd}
            busy={state.phase === 'signing'}
            error={problem ?? state.error}
            onSubmit={() => void submit()}
          />
        </>
      )}
      {state.phase === 'done' && state.result && <SignDone result={state.result} />}
      <SmallPrint>
        {(state.phase === 'ready' || state.phase === 'signing') && SIGN_COPY.forYouOnly}
      </SmallPrint>
    </PublicShell>
  );
}
