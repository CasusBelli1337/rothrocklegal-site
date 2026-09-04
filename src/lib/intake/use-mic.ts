'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { isSecureContext } from './browser';
import { MIC_COPY } from './copy-mic';
import {
  classifyMediaError,
  classifySpeechError,
  micReducer,
  preflightMic,
  type MicFailure,
  type MicPhase,
  type MicProbe,
  type PermissionResult,
} from './mic-help';
import {
  createTranscriber,
  detectSpeechSupport,
  startRecording,
  type Recorder,
  type SpeechSupport,
  type Transcriber,
} from './speech';

export interface MicHandlers {
  onInterim(text: string): void;
  onFinal(text: string): void;
  /** Recorded audio to upload as the `voice-note` slot. */
  onVoiceNote(file: File): void;
}

export interface MicController {
  phase: MicPhase;
  support: SpeechSupport;
  /** A short problem line under the button; cleared on the next press. */
  notice: string | null;
  /** Start, or stop while listening. */
  press(): void;
  /** From a help card: re-run the pre-flight and start as soon as it allows. */
  retry(): void;
}

const NONE: SpeechSupport = { transcript: false, recording: false };

const FAILURE_NOTICE: Record<MicFailure, string | null> = {
  denied: null,
  'no-microphone': null,
  busy: MIC_COPY.busy,
  other: MIC_COPY.couldNotStart,
};

function speechNotice(code: string, reason: MicFailure): string | null {
  if (reason !== 'other') return null;
  if (code === 'network') return MIC_COPY.noConnection;
  if (code === 'start-failed') return MIC_COPY.couldNotStart;
  return MIC_COPY.stopped;
}

/** The pre-flight probe over the real browser; every call is optional and may throw. */
function browserProbe(support: SpeechSupport): MicProbe {
  if (typeof navigator === 'undefined') return { support };
  const media = navigator.mediaDevices;
  const permissions = navigator.permissions;
  return {
    support,
    secure: isSecureContext(),
    devices: media?.enumerateDevices ? () => media.enumerateDevices() : undefined,
    permission: permissions?.query
      ? async () => {
          const status = await permissions.query({ name: 'microphone' as PermissionName });
          return status.state as PermissionResult;
        }
      : undefined,
  };
}

/** Owns the transcriber and recorder; the phase comes from `micReducer`. */
export function useMic(handlers: MicHandlers): MicController {
  const [support, setSupport] = useState<SpeechSupport>(NONE);
  const [phase, dispatch] = useReducer(micReducer, 'checking');
  const [notice, setNotice] = useState<string | null>(null);
  const latest = useRef(handlers);
  latest.current = handlers;
  const transcriber = useRef<Transcriber | null>(null);
  const recorder = useRef<Recorder | null>(null);
  const startAfterCheck = useRef(false);

  useEffect(() => {
    if (phase !== 'checking') return;
    let alive = true;
    const detected = detectSpeechSupport();
    setSupport(detected);
    void preflightMic(browserProbe(detected)).then((result) => {
      if (alive) dispatch({ type: 'preflight', result });
    });
    return () => {
      alive = false;
    };
  }, [phase]);

  const stop = useCallback(async () => {
    transcriber.current?.stop();
    transcriber.current = null;
    const active = recorder.current;
    recorder.current = null;
    latest.current.onInterim('');
    dispatch({ type: 'stopped' });
    const file = await active?.stop();
    if (file) latest.current.onVoiceNote(file);
  }, []);

  const fail = useCallback(
    (reason: MicFailure, text: string | null) => {
      void stop();
      setNotice(text);
      dispatch({ type: 'failed', reason });
    },
    [stop],
  );

  const begin = useCallback(async () => {
    setNotice(null);
    dispatch({ type: 'press' });
    if (support.recording) {
      try {
        recorder.current = await startRecording();
      } catch (error) {
        const reason = classifyMediaError(error);
        fail(reason, FAILURE_NOTICE[reason]);
        return;
      }
    }
    if (support.transcript) {
      transcriber.current = createTranscriber({
        onInterim: (text) => latest.current.onInterim(text),
        onFinal: (text) => latest.current.onFinal(text),
        onError: (code) => {
          const reason = classifySpeechError(code);
          fail(reason, speechNotice(code, reason));
        },
        onStop: () => dispatch({ type: 'stopped' }),
      });
      transcriber.current?.start();
    }
    dispatch({ type: 'started' });
  }, [support, fail]);

  const press = useCallback(() => {
    if (phase === 'listening' || phase === 'asking') void stop();
    else if (phase === 'prompt' || phase === 'ready') void begin();
  }, [phase, stop, begin]);

  const retry = useCallback(() => {
    startAfterCheck.current = true;
    setNotice(null);
    dispatch({ type: 'retry' });
  }, []);

  // A retry that passes the pre-flight starts listening at once: that is what "Try again" promised.
  useEffect(() => {
    if (!startAfterCheck.current || phase === 'checking') return;
    startAfterCheck.current = false;
    if (phase === 'prompt' || phase === 'ready') void begin();
  }, [phase, begin]);

  useEffect(
    () => () => {
      transcriber.current?.stop();
      void recorder.current?.stop();
    },
    [],
  );

  return { phase, support, notice, press, retry };
}
