import { describe, expect, it } from 'vitest';
import {
  classifyMediaError,
  classifySpeechError,
  micReducer,
  preflightMic,
  showsButton,
  type MicPhase,
} from './mic-help';

const both = { transcript: true, recording: true };
const none = { transcript: false, recording: false };
const devices = (kinds: string[]) => () => Promise.resolve(kinds.map((kind) => ({ kind })));

describe('preflightMic', () => {
  it('reports an unsupported browser before touching devices', async () => {
    const probe = {
      support: none,
      devices: () => Promise.reject(new Error('should not be called')),
    };
    expect(await preflightMic(probe)).toBe('unsupported');
  });

  it('finds no microphone only when other devices are listed', async () => {
    expect(await preflightMic({ support: both, devices: devices(['audiooutput']) })).toBe(
      'no-microphone',
    );
    expect(
      await preflightMic({ support: both, devices: devices(['videoinput', 'audiooutput']) }),
    ).toBe('no-microphone');
    // An empty list is the browser hiding devices until permission, not a missing microphone.
    expect(await preflightMic({ support: both, devices: devices([]) })).toBe('prompt');
    expect(await preflightMic({ support: both, devices: devices(['audioinput']) })).toBe('prompt');
  });

  it('maps the permission state and treats a throwing query as unknown', async () => {
    const probe = { support: both, devices: devices(['audioinput']) };
    expect(await preflightMic({ ...probe, permission: () => Promise.resolve('granted') })).toBe(
      'ready',
    );
    expect(await preflightMic({ ...probe, permission: () => Promise.resolve('denied') })).toBe(
      'denied',
    );
    expect(await preflightMic({ ...probe, permission: () => Promise.resolve('prompt') })).toBe(
      'prompt',
    );
    expect(
      await preflightMic({ ...probe, permission: () => Promise.reject(new TypeError('safari')) }),
    ).toBe('prompt');
  });

  it('never fails when enumerateDevices throws or is missing', async () => {
    expect(await preflightMic({ support: both })).toBe('prompt');
    expect(
      await preflightMic({ support: both, devices: () => Promise.reject(new Error('nope')) }),
    ).toBe('prompt');
  });
});

describe('micReducer', () => {
  const run = (start: MicPhase, ...events: Parameters<typeof micReducer>[1][]) =>
    events.reduce(micReducer, start);

  it('walks the happy path: check, prompt, press, listen, stop', () => {
    expect(run('checking', { type: 'preflight', result: 'prompt' })).toBe('prompt');
    expect(run('prompt', { type: 'press' })).toBe('asking');
    expect(run('asking', { type: 'started' })).toBe('listening');
    expect(run('listening', { type: 'stopped' })).toBe('ready');
    expect(run('ready', { type: 'press' }, { type: 'started' })).toBe('listening');
  });

  it('lands on the help card when the browser refuses', () => {
    expect(run('asking', { type: 'failed', reason: 'denied' })).toBe('denied');
    expect(run('asking', { type: 'failed', reason: 'no-microphone' })).toBe('no-microphone');
    expect(run('listening', { type: 'failed', reason: 'denied' })).toBe('denied');
  });

  it('returns to ready after a busy or unknown failure so the button stays', () => {
    expect(run('asking', { type: 'failed', reason: 'busy' })).toBe('ready');
    expect(run('asking', { type: 'failed', reason: 'other' })).toBe('ready');
  });

  it('re-checks on retry from a card, and ignores retry elsewhere', () => {
    expect(run('denied', { type: 'retry' })).toBe('checking');
    expect(run('no-microphone', { type: 'retry' })).toBe('checking');
    expect(run('ready', { type: 'retry' })).toBe('ready');
    expect(run('unsupported', { type: 'retry' })).toBe('unsupported');
  });

  it('ignores presses and late pre-flight answers out of order', () => {
    expect(run('denied', { type: 'press' })).toBe('denied');
    expect(run('unsupported', { type: 'press' })).toBe('unsupported');
    expect(run('listening', { type: 'preflight', result: 'denied' })).toBe('listening');
    expect(run('asking', { type: 'stopped' })).toBe('ready');
  });

  it('offers the button only in the phases that can use it', () => {
    expect(showsButton('prompt')).toBe(true);
    expect(showsButton('listening')).toBe(true);
    expect(showsButton('denied')).toBe(false);
    expect(showsButton('checking')).toBe(false);
  });
});

describe('error classification', () => {
  it('reads getUserMedia rejections by name', () => {
    expect(classifyMediaError({ name: 'NotAllowedError' })).toBe('denied');
    expect(classifyMediaError({ name: 'NotFoundError' })).toBe('no-microphone');
    expect(classifyMediaError({ name: 'NotReadableError' })).toBe('busy');
    expect(classifyMediaError({ name: 'Whatever' })).toBe('other');
    expect(classifyMediaError(undefined)).toBe('other');
    expect(classifyMediaError('string')).toBe('other');
  });

  it('reads Web Speech error codes', () => {
    expect(classifySpeechError('not-allowed')).toBe('denied');
    expect(classifySpeechError('audio-capture')).toBe('no-microphone');
    expect(classifySpeechError('network')).toBe('other');
  });
});
