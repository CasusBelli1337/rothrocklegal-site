// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { consentConfig } from '@/config/consent';
import {
  closeConsentPanel,
  consentSnapshot,
  hasConsent,
  openConsentPanel,
  refreshConsent,
  saveConsent,
  subscribeConsent,
} from './client';
import { recordOf, storageWith, throwingStorage } from './testing';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  closeConsentPanel();
});

describe('consent client', () => {
  it('starts denied and asking, and stamps html[data-consent="ask"]', () => {
    refreshConsent();
    expect(consentSnapshot().needsChoice).toBe(true);
    expect(hasConsent('analytics')).toBe(false);
    expect(document.documentElement.dataset.consent).toBe('ask');
  });

  it('saves a yes, stamps the attribute, and tells every reader', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);
    saveConsent({ analytics: true, advertising: false });
    expect(listener).toHaveBeenCalled();
    expect(hasConsent('analytics')).toBe(true);
    expect(document.documentElement.dataset.consent).toBe('analytics');
    const stored = JSON.parse(localStorage.getItem(consentConfig.storageKey) ?? 'null');
    expect(stored).toMatchObject({ version: consentConfig.version, granted: ['analytics'] });
    expect(typeof stored.savedAt).toBe('number');
    unsubscribe();
  });

  it('withdraws: a later no turns analytics off', () => {
    saveConsent({ analytics: true, advertising: false });
    saveConsent({ analytics: false, advertising: false });
    expect(hasConsent('analytics')).toBe(false);
    expect(document.documentElement.dataset.consent).toBe('none');
  });

  it('opens and closes the panel without changing the choice', () => {
    saveConsent({ analytics: false, advertising: false });
    openConsentPanel();
    expect(consentSnapshot().panelOpen).toBe(true);
    closeConsentPanel();
    expect(consentSnapshot().panelOpen).toBe(false);
    expect(consentSnapshot().needsChoice).toBe(false);
  });

  it('honours GPC over an earlier yes', () => {
    localStorage.setItem(consentConfig.storageKey, JSON.stringify(recordOf()));
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    refreshConsent();
    expect(hasConsent('analytics')).toBe(false);
    expect(consentSnapshot().signal).toBe('gpc');
    expect(document.documentElement.dataset.consent).toBe('ask');
  });

  it('keeps a choice for this page when storage is blocked', () => {
    vi.stubGlobal('localStorage', throwingStorage());
    saveConsent({ analytics: true, advertising: false });
    expect(hasConsent('analytics')).toBe(true);
    expect(consentSnapshot().needsChoice).toBe(false);
  });

  it('reads a stored choice from another tab or visit on refresh', () => {
    vi.stubGlobal('localStorage', storageWith(recordOf({ granted: [] })));
    refreshConsent();
    expect(consentSnapshot().needsChoice).toBe(false);
    expect(document.documentElement.dataset.consent).toBe('none');
  });
});
