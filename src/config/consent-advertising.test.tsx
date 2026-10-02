// @vitest-environment jsdom
import fs from 'node:fs';
import path from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { PrivacyChoicesButton } from '@/components/consent/PrivacyChoicesButton';
import { consentModeUpdate } from '@/lib/analytics/tag';
import { CONSENT_BOOT_MAX_BYTES, consentBootScript } from '@/lib/consent/boot';
import { closeConsentPanel, hasConsent, refreshConsent } from '@/lib/consent/client';
import { effectiveConsent, makeRecord } from '@/lib/consent/store';
import { recordOf } from '@/lib/consent/testing';
import { advertisingActive, type ConsentVendor, consentCategory } from './consent';
import { consentCopy, policyAdvertising, privacyChoicesLabel } from './consent-copy';

/**
 * The day advertising turns on (#seam:consent-advertising): one vendor entry in
 * config/consent.ts. Vitest gives each test file its own modules, so listing a
 * vendor here touches no other test.
 */
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const NOW = Date.now();

beforeAll(() => {
  (consentCategory('advertising').vendors as ConsentVendor[]).push({
    name: 'Meta Pixel',
    privacyUrl: 'https://www.facebook.com/privacy/policy/',
  });
});

beforeEach(() => {
  localStorage.clear();
  act(() => refreshConsent());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  act(() => closeConsentPanel());
});

describe('with an advertising vendor listed', () => {
  it('flips the footer link to the CCPA opt-out name and the policy sentences', () => {
    expect(advertisingActive()).toBe(true);
    expect(privacyChoicesLabel()).toBe('Do Not Sell or Share My Personal Information');
    expect(policyAdvertising().full).toContain('Meta Pixel');
  });

  it('keeps the boot script under its cap and drops advertising under a signal', () => {
    const script = consentBootScript();
    expect(Buffer.byteLength(script)).toBeLessThan(CONSENT_BOOT_MAX_BYTES);
    const run = (nav: object) => {
      const dataset: Record<string, string> = {};
      const storage = {
        getItem: () =>
          JSON.stringify(recordOf({ granted: ['analytics', 'advertising'], signal: true })),
      };
      new Function('localStorage', 'navigator', 'document', script)(storage, nav, {
        documentElement: { dataset },
      });
      return dataset.consent;
    };
    expect(run({})).toBe('analytics advertising');
    expect(run({ globalPrivacyControl: true })).toBe('analytics');
  });

  it('never lets a signal grant advertising, even with a stored yes', () => {
    expect(makeRecord({ analytics: true, advertising: true }, NOW, 'gpc').granted).toEqual([
      'analytics',
    ]);
    const yes = recordOf({ savedAt: NOW, granted: ['analytics', 'advertising'], signal: true });
    expect(effectiveConsent(yes, NOW, null)).toEqual({ analytics: true, advertising: true });
    expect(effectiveConsent(yes, NOW, 'dnt').advertising).toBe(false);
    expect(consentModeUpdate({ analytics: true, advertising: true }).ad_user_data).toBe('granted');
  });

  it('shows the advertising switch, which "Accept analytics" never turns on', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: consentCopy.choose }));
    expect(screen.getAllByRole('switch')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: consentCopy.accept }));
    expect(hasConsent('analytics')).toBe(true);
    expect(hasConsent('advertising')).toBe(false);
  });

  it('locks the advertising switch off under Global Privacy Control', () => {
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    act(() => refreshConsent());
    render(
      <>
        <ConsentBanner />
        <PrivacyChoicesButton />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: consentCopy.choose }));
    const ads = screen.getByRole('switch', { name: 'Advertising' }) as HTMLInputElement;
    expect(ads.checked).toBe(false);
    expect(ads.disabled).toBe(true);
    expect(screen.getByRole('button', { name: privacyChoicesLabel() })).toBeTruthy();
  });
});

describe('#seam:consent-advertising ledger', () => {
  it('lists every file that carries the marker in docs/CONSENT.md, and nothing else', () => {
    const root = process.cwd();
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });
    const marked = walk(path.join(root, 'src'))
      .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
      .filter((f) => fs.readFileSync(f, 'utf8').includes('#seam:consent-advertising'))
      .map((f) => path.relative(root, f))
      .sort();
    const doc = fs.readFileSync(path.join(root, 'docs', 'CONSENT.md'), 'utf8');
    const ledger =
      /<!-- seam:consent-advertising -->([\s\S]*?)<!-- \/seam -->/.exec(doc)?.[1] ?? '';
    const listed = [...ledger.matchAll(/`(src\/[^`]+)`/g)].map((m) => m[1]).sort();
    expect(marked.length).toBeGreaterThan(0);
    expect(listed).toEqual(marked);
  });
});
