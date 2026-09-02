import { describe, expect, it, vi } from 'vitest';
import {
  createTranscriber,
  detectSpeechSupport,
  type SpeechRecognitionLike,
  type TranscriberHandlers,
} from './speech';

/** A controllable stand-in for the browser's SpeechRecognition. */
class FakeRecognition implements SpeechRecognitionLike {
  static instances: FakeRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: SpeechRecognitionLike['onresult'] = null;
  onend: SpeechRecognitionLike['onend'] = null;
  onerror: SpeechRecognitionLike['onerror'] = null;
  start = vi.fn();
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();
  constructor() {
    FakeRecognition.instances.push(this);
  }
  emit(results: { text: string; isFinal: boolean }[], resultIndex = 0) {
    this.onresult?.({
      resultIndex,
      results: results.map((r) => ({ isFinal: r.isFinal, 0: { transcript: r.text } })),
    });
  }
}

function handlers(): TranscriberHandlers & { calls: Record<string, unknown[]> } {
  const calls: Record<string, unknown[]> = { interim: [], final: [], error: [], stop: [] };
  return {
    calls,
    onInterim: (t) => calls.interim.push(t),
    onFinal: (t) => calls.final.push(t),
    onError: (m) => calls.error.push(m),
    onStop: () => calls.stop.push(true),
  };
}

const withRecording = {
  MediaRecorder: function MediaRecorder() {},
  navigator: { mediaDevices: { getUserMedia: () => Promise.resolve() } },
};

describe('detectSpeechSupport', () => {
  it('reports nothing on a bare window or on the server', () => {
    expect(detectSpeechSupport({})).toEqual({ transcript: false, recording: false });
    expect(detectSpeechSupport(undefined)).toEqual({ transcript: false, recording: false });
  });

  it('finds the standard and the webkit constructors', () => {
    expect(detectSpeechSupport({ SpeechRecognition: FakeRecognition }).transcript).toBe(true);
    expect(detectSpeechSupport({ webkitSpeechRecognition: FakeRecognition }).transcript).toBe(true);
    expect(detectSpeechSupport({ SpeechRecognition: 'nope' }).transcript).toBe(false);
  });

  it('needs both MediaRecorder and getUserMedia for recording', () => {
    expect(detectSpeechSupport(withRecording).recording).toBe(true);
    expect(detectSpeechSupport({ MediaRecorder: withRecording.MediaRecorder }).recording).toBe(
      false,
    );
    expect(detectSpeechSupport({ navigator: withRecording.navigator }).recording).toBe(false);
  });
});

describe('createTranscriber', () => {
  it('returns null without support', () => {
    expect(createTranscriber(handlers(), {})).toBeNull();
  });

  it('streams interim text and appends final phrases', () => {
    const h = handlers();
    const transcriber = createTranscriber(h, { SpeechRecognition: FakeRecognition });
    const recognition = FakeRecognition.instances.at(-1)!;
    transcriber?.start();
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.start).toHaveBeenCalledTimes(1);
    recognition.emit([{ text: 'my mother ', isFinal: false }]);
    expect(h.calls.interim).toEqual(['my mother']);
    recognition.emit([{ text: 'my mother died in March.', isFinal: true }]);
    expect(h.calls.final).toEqual(['my mother died in March.']);
    expect(h.calls.interim.at(-1)).toBe('');
  });

  it("restarts after the browser's pause and stops for good on stop()", () => {
    const h = handlers();
    const transcriber = createTranscriber(h, { webkitSpeechRecognition: FakeRecognition });
    const recognition = FakeRecognition.instances.at(-1)!;
    transcriber?.start();
    recognition.onend?.();
    expect(recognition.start).toHaveBeenCalledTimes(2);
    expect(h.calls.stop).toEqual([]);
    transcriber?.stop();
    expect(recognition.stop).toHaveBeenCalledTimes(1);
    expect(recognition.start).toHaveBeenCalledTimes(2);
    expect(h.calls.stop).toEqual([true]);
  });

  it('explains a blocked microphone and ignores silence', () => {
    const h = handlers();
    const transcriber = createTranscriber(h, { SpeechRecognition: FakeRecognition });
    const recognition = FakeRecognition.instances.at(-1)!;
    transcriber?.start();
    recognition.onerror?.({ error: 'no-speech' });
    expect(h.calls.error).toEqual([]);
    recognition.onerror?.({ error: 'not-allowed' });
    expect(h.calls.error[0]).toMatch(/blocked the microphone/);
  });
});
