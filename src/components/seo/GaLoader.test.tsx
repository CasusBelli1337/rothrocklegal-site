// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { refreshConsent, saveConsent } from '@/lib/consent/client';
import { GaLoader } from './GaLoader';

type GaTestWindow = Window & {
  dataLayer?: unknown[];
  gtag?: unknown;
  'ga-disable-G-TEST123'?: boolean;
};
const w = window as GaTestWindow;

function gtagScripts(): HTMLScriptElement[] {
  return Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[src*="googletagmanager"]'),
  );
}

beforeEach(() => {
  localStorage.clear();
  act(() => refreshConsent());
});

afterEach(() => {
  cleanup();
  gtagScripts().forEach((s) => s.remove());
  delete w.dataLayer;
  delete w.gtag;
});

describe('GaLoader', () => {
  it('loads nothing from Google before the visitor chooses', async () => {
    render(<GaLoader measurementId="G-TEST123" />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(gtagScripts()).toEqual([]);
    expect(w.gtag).toBeUndefined();
    expect(w.dataLayer).toBeUndefined();
  });

  it('loads gtag.js once after "Accept analytics", Consent Mode default first', async () => {
    render(<GaLoader measurementId="G-TEST123" />);
    act(() => saveConsent({ analytics: true, advertising: false }));
    await waitFor(() => expect(gtagScripts()).toHaveLength(1));
    expect(gtagScripts()[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    const first = Array.from(w.dataLayer?.[0] as ArrayLike<unknown>);
    expect(first.slice(0, 2)).toEqual(['consent', 'default']);
  });

  it('switches GA off and removes its cookies when the visitor says no later', async () => {
    document.cookie = '_ga=GA1.1.123; path=/';
    render(<GaLoader measurementId="G-TEST123" />);
    act(() => saveConsent({ analytics: true, advertising: false }));
    await waitFor(() => expect(gtagScripts()).toHaveLength(1));
    act(() => saveConsent({ analytics: false, advertising: false }));
    expect(w['ga-disable-G-TEST123']).toBe(true);
    expect(document.cookie).not.toContain('_ga=');
    const last = Array.from(w.dataLayer?.at(-1) as ArrayLike<unknown>);
    expect(last.slice(0, 2)).toEqual(['consent', 'update']);
    expect((last[2] as Record<string, string>).analytics_storage).toBe('denied');
  });

  it('removes GA cookies left from before the site asked, for a visitor who has not said yes', () => {
    document.cookie = '_ga=GA1.1.999; path=/';
    render(<GaLoader measurementId="G-TEST123" />);
    expect(document.cookie).not.toContain('_ga=');
    expect(gtagScripts()).toEqual([]);
  });
});
