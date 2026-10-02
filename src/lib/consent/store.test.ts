import { describe, expect, it } from 'vitest';
import { consentConfig } from '@/config/consent';
import {
  consentAttribute,
  DENIED,
  effectiveConsent,
  isRecordCurrent,
  loadRecord,
  makeRecord,
  MAX_AGE_MS,
  needsChoice,
  parseRecord,
  privacySignal,
  saveRecord,
} from './store';
import { memoryStorage, recordOf, storageWith, throwingStorage } from './testing';

const NOW = Date.UTC(2026, 9, 1, 12);
const DAY = 24 * 60 * 60 * 1000;

describe('default', () => {
  it('is denied for everything and asks, with nothing stored', () => {
    expect(effectiveConsent(null, NOW, null)).toEqual(DENIED);
    expect(needsChoice(null, NOW, null)).toBe(true);
    expect(consentAttribute(null, NOW, null)).toBe('ask');
    expect(loadRecord(memoryStorage())).toBeNull();
  });
});

describe('a choice', () => {
  it('grants analytics after "Accept analytics" and stops asking', () => {
    const record = makeRecord({ analytics: true, advertising: false }, NOW, null);
    expect(record).toEqual({
      version: consentConfig.version,
      savedAt: NOW,
      granted: ['analytics'],
      signal: false,
    });
    expect(effectiveConsent(record, NOW, null)).toEqual({ analytics: true, advertising: false });
    expect(needsChoice(record, NOW, null)).toBe(false);
    expect(consentAttribute(record, NOW, null)).toBe('analytics');
  });

  it('records a decline, which also stops asking', () => {
    const record = makeRecord(DENIED, NOW, null);
    expect(record.granted).toEqual([]);
    expect(effectiveConsent(record, NOW, null)).toEqual(DENIED);
    expect(needsChoice(record, NOW, null)).toBe(false);
    expect(consentAttribute(record, NOW, null)).toBe('none');
  });

  it('never grants advertising while no advertising vendor is listed', () => {
    const record = makeRecord({ analytics: true, advertising: true }, NOW, null);
    expect(record.granted).toEqual(['analytics']);
    const tampered = recordOf({ savedAt: NOW, granted: ['analytics', 'advertising'] });
    expect(effectiveConsent(tampered, NOW, null).advertising).toBe(false);
  });

  it('round-trips through storage', () => {
    const storage = memoryStorage();
    const record = makeRecord({ analytics: true, advertising: false }, NOW, null);
    expect(saveRecord(record, storage)).toBe(true);
    expect(loadRecord(storage)).toEqual(record);
  });
});

describe('expiry and version', () => {
  it('asks again once the choice is 12 months old', () => {
    const record = recordOf({ savedAt: NOW });
    expect(isRecordCurrent(record, NOW + 364 * DAY, null)).toBe(true);
    expect(isRecordCurrent(record, NOW + MAX_AGE_MS, null)).toBe(false);
    expect(needsChoice(record, NOW + 366 * DAY, null)).toBe(true);
    expect(effectiveConsent(record, NOW + 366 * DAY, null)).toEqual(DENIED);
  });

  it('asks again when the saved version is not the current one', () => {
    const old = recordOf({ savedAt: NOW, version: consentConfig.version - 1 });
    const next = recordOf({ savedAt: NOW, version: consentConfig.version + 1 });
    for (const record of [old, next]) {
      expect(needsChoice(record, NOW, null)).toBe(true);
      expect(effectiveConsent(record, NOW, null)).toEqual(DENIED);
    }
  });

  it('distrusts a choice dated in the future', () => {
    expect(needsChoice(recordOf({ savedAt: NOW + DAY }), NOW, null)).toBe(true);
  });
});

describe('Global Privacy Control and Do Not Track', () => {
  it('reads GPC first, then DNT, and nothing else', () => {
    expect(privacySignal({ globalPrivacyControl: true, doNotTrack: '1' })).toBe('gpc');
    expect(privacySignal({ doNotTrack: '1' })).toBe('dnt');
    expect(privacySignal({ globalPrivacyControl: false, doNotTrack: '0' })).toBeNull();
    expect(privacySignal({ doNotTrack: 'unspecified' })).toBeNull();
    expect(privacySignal(undefined)).toBeNull();
  });

  it('treats a signal as a no: nothing runs before a choice', () => {
    for (const signal of ['gpc', 'dnt'] as const) {
      expect(effectiveConsent(null, NOW, signal)).toEqual(DENIED);
      expect(needsChoice(null, NOW, signal)).toBe(true);
    }
  });

  it('overrides a yes given before the signal appeared, and asks again', () => {
    const before = recordOf({ savedAt: NOW, granted: ['analytics'], signal: false });
    expect(effectiveConsent(before, NOW, 'gpc')).toEqual(DENIED);
    expect(needsChoice(before, NOW, 'dnt')).toBe(true);
    expect(consentAttribute(before, NOW, 'gpc')).toBe('ask');
  });

  it('keeps a yes to analytics the visitor gave with the signal note in front of them', () => {
    const record = makeRecord({ analytics: true, advertising: false }, NOW, 'gpc');
    expect(record.signal).toBe(true);
    expect(effectiveConsent(record, NOW, 'gpc')).toEqual({ analytics: true, advertising: false });
    expect(consentAttribute(record, NOW, 'gpc')).toBe('analytics');
  });
});

describe('parseRecord and storage failures', () => {
  it('rejects anything malformed', () => {
    expect(parseRecord(null)).toBeNull();
    expect(parseRecord('analytics')).toBeNull();
    expect(parseRecord({ version: '1', savedAt: NOW, granted: [] })).toBeNull();
    expect(parseRecord({ version: 1, savedAt: String(NOW), granted: [] })).toBeNull();
    expect(parseRecord({ version: 1, savedAt: NOW, granted: 'analytics' })).toBeNull();
  });

  it('keeps only known categories and a strict boolean signal', () => {
    expect(
      parseRecord({ version: 1, savedAt: NOW, granted: ['analytics', 'x', 7], signal: 'yes' }),
    ).toEqual({ version: 1, savedAt: NOW, granted: ['analytics'], signal: false });
  });

  it('falls back to "no" when storage is garbage or throws', () => {
    expect(loadRecord(memoryStorage({ [consentConfig.storageKey]: '{oops' }))).toBeNull();
    expect(loadRecord(storageWith([1, 2]))).toBeNull();
    expect(loadRecord(throwingStorage())).toBeNull();
    expect(saveRecord(recordOf(), throwingStorage())).toBe(false);
  });
});
