import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { consentConfig } from '@/config/consent';
import { CONSENT_BOOT_MAX_BYTES, consentBootScript } from './boot';
import { consentAttribute, loadRecord, MAX_AGE_MS, privacySignal } from './store';
import { memoryStorage, recordOf, throwingStorage } from './testing';

const NOW = Date.UTC(2026, 9, 1, 12);

/** Runs the inline script against fake globals and returns what it stamped on <html>. */
function run(storage: Storage, navigator: object = {}, now = NOW): string | undefined {
  const dataset: Record<string, string> = {};
  const document = { documentElement: { dataset } };
  const FakeDate = { now: () => now };
  new Function('localStorage', 'navigator', 'document', 'Date', consentBootScript())(
    storage,
    navigator,
    document,
    FakeDate,
  );
  return dataset.consent;
}

function stored(value: unknown): Storage {
  return memoryStorage(
    value === undefined ? {} : { [consentConfig.storageKey]: JSON.stringify(value) },
  );
}

const RECORDS: Record<string, unknown> = {
  nothing: undefined,
  accepted: recordOf({ savedAt: NOW - 1000 }),
  declined: recordOf({ savedAt: NOW - 1000, granted: [] }),
  'accepted under a signal': recordOf({ savedAt: NOW - 1000, signal: true }),
  'older version': recordOf({ savedAt: NOW - 1000, version: 0 }),
  expired: recordOf({ savedAt: NOW - MAX_AGE_MS }),
  'from the future': recordOf({ savedAt: NOW + 60_000 }),
  'string date': { ...recordOf(), savedAt: String(NOW - 1000) },
  'string granted': { ...recordOf({ savedAt: NOW - 1000 }), granted: 'analytics' },
  'unknown category': recordOf({ savedAt: NOW - 1000, granted: ['analytics', 'x' as never] }),
  'a bare string': 'analytics',
  null: null,
};

const SIGNALS: Record<string, object> = {
  none: {},
  gpc: { globalPrivacyControl: true },
  dnt: { doNotTrack: '1' },
  'dnt off': { doNotTrack: '0', globalPrivacyControl: false },
};

describe('consentBootScript', () => {
  it('stays small and makes no external calls', () => {
    const script = consentBootScript();
    expect(Buffer.byteLength(script)).toBeLessThan(CONSENT_BOOT_MAX_BYTES);
    expect(script).not.toMatch(/fetch|XMLHttpRequest|http|import|googletagmanager/);
    expect(script).toContain(`'${consentConfig.storageKey}'`);
  });

  it('shares its byte cap with scripts/check-consent.mjs', () => {
    const script = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'check-consent.mjs'),
      'utf8',
    );
    expect(script).toContain(`const BOOT_MAX_BYTES = ${CONSENT_BOOT_MAX_BYTES};`);
  });

  it('agrees with the store on every stored value and signal', () => {
    for (const [recordName, value] of Object.entries(RECORDS)) {
      for (const [signalName, nav] of Object.entries(SIGNALS)) {
        const storage = stored(value);
        const expected = consentAttribute(loadRecord(storage), NOW, privacySignal(nav));
        expect(run(storage, nav), `${recordName} / ${signalName}`).toBe(expected);
      }
    }
  });

  it('stamps "ask" on a first visit and the granted category once chosen', () => {
    expect(run(stored(undefined))).toBe('ask');
    expect(run(stored(recordOf({ savedAt: NOW })))).toBe('analytics');
    expect(run(stored(recordOf({ savedAt: NOW, granted: [] })))).toBe('none');
  });

  it('asks again when a signal appears after a yes', () => {
    expect(run(stored(recordOf({ savedAt: NOW })), { globalPrivacyControl: true })).toBe('ask');
  });

  it('asks when storage is garbage or throws', () => {
    expect(run(memoryStorage({ [consentConfig.storageKey]: '{oops' }))).toBe('ask');
    expect(run(throwingStorage())).toBe('ask');
  });
});
