import { describe, expect, it } from 'vitest';
import type { ConsentState } from '@/lib/consent/store';
import {
  CONSENT_DEFAULTS,
  clearGaCookies,
  consentModeUpdate,
  GA_PRIVACY_CONFIG,
  type GaWindow,
  startGa,
  stopGa,
  type TagHost,
} from './tag';

const YES: ConsentState = { analytics: true, advertising: false };
const NO: ConsentState = { analytics: false, advertising: false };

/** A fake page at `href` that records cookie writes and injected scripts. */
function fakeHost(href: string, cookie = '') {
  const url = new URL(href);
  const injected: { src: string; async: boolean }[] = [];
  const cookieWrites: string[] = [];
  const doc = {
    createElement: () => ({ src: '', async: false }),
    head: { appendChild: (el: { src: string; async: boolean }) => injected.push(el) },
    get cookie() {
      return cookie;
    },
    set cookie(value: string) {
      cookieWrites.push(value);
    },
  };
  const win: GaWindow = {};
  const host: TagHost = {
    window: win,
    document: doc,
    location: { pathname: url.pathname, href: url.href, hostname: url.hostname },
  };
  const calls = () => (win.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
  return { host, win, injected, cookieWrites, calls };
}

describe('startGa', () => {
  it('sets Consent Mode defaults first, then the update, then the tag, and loads gtag.js once', () => {
    const page = fakeHost('https://www.rothrocklegal.com/trust-contests/');
    expect(startGa(page.host, 'G-TEST123', YES)).toBe(true);
    const calls = page.calls();
    expect(calls.map((c) => c.slice(0, 2))).toEqual([
      ['consent', 'default'],
      ['consent', 'update'],
      ['js', calls[2][1]],
      ['config', 'G-TEST123'],
    ]);
    expect(calls[0][2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(calls[1][2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });
    expect(calls[3][2]).toEqual(GA_PRIVACY_CONFIG);
    expect(page.injected).toEqual([
      { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123' },
    ]);
    // dataLayer entries are Arguments objects, which is what gtag.js reads.
    expect(Object.prototype.toString.call(page.win.dataLayer?.[0])).toBe('[object Arguments]');
  });

  it('loads nothing without a yes to analytics', () => {
    const page = fakeHost('https://www.rothrocklegal.com/');
    expect(startGa(page.host, 'G-TEST123', NO)).toBe(false);
    expect(page.win.dataLayer).toBeUndefined();
    expect(page.win.gtag).toBeUndefined();
    expect(page.injected).toEqual([]);
  });

  it('never runs on the emailed-link pages', () => {
    for (const path of ['/sign/?t=abc', '/schedule/?t=abc']) {
      const page = fakeHost(`https://www.rothrocklegal.com${path}`);
      expect(startGa(page.host, 'G-TEST123', YES)).toBe(false);
      expect(page.calls()).toEqual([]);
      expect(page.injected).toEqual([]);
    }
  });

  it('reports a resume landing without its one-use token', () => {
    const page = fakeHost(
      'https://www.rothrocklegal.com/request-a-consult/?resume=secret-token&utm_source=email',
    );
    startGa(page.host, 'G-TEST123', YES);
    const config = page.calls().find((c) => c[0] === 'config');
    expect(config?.[2]).toEqual({
      ...GA_PRIVACY_CONFIG,
      page_location: 'https://www.rothrocklegal.com/request-a-consult/?utm_source=email',
    });
    expect(JSON.stringify(page.calls())).not.toContain('secret-token');
  });

  it('after a withdrawal and a new yes on the same page, re-grants without loading twice', () => {
    const page = fakeHost('https://www.rothrocklegal.com/');
    startGa(page.host, 'G-TEST123', YES);
    stopGa(page.host, 'G-TEST123');
    expect(page.win['ga-disable-G-TEST123']).toBe(true);
    startGa(page.host, 'G-TEST123', YES);
    expect(page.win['ga-disable-G-TEST123']).toBe(false);
    expect(page.injected).toHaveLength(1);
    const consent = page.calls().filter((c) => c[0] === 'consent');
    expect(consent.map((c) => (c[2] as Record<string, string>).analytics_storage)).toEqual([
      'denied',
      'granted',
      'denied',
      'granted',
    ]);
  });
});

describe('stopGa', () => {
  it('denies everything, switches the tag off, and expires GA cookies on the host and parent domain', () => {
    const page = fakeHost(
      'https://www.rothrocklegal.com/',
      '_ga=GA1.1.1; rl-other=1; _ga_JC25W690LQ=GS1.1; _gat=1',
    );
    startGa(page.host, 'G-TEST123', YES);
    stopGa(page.host, 'G-TEST123');
    expect(page.calls().at(-1)).toEqual(['consent', 'update', CONSENT_DEFAULTS]);
    expect(page.win['ga-disable-G-TEST123']).toBe(true);
    expect(page.cookieWrites).toContain('_ga=; Max-Age=0; path=/; domain=.rothrocklegal.com');
    expect(page.cookieWrites).toContain(
      '_ga_JC25W690LQ=; Max-Age=0; path=/; domain=.www.rothrocklegal.com',
    );
    expect(page.cookieWrites.some((w) => w.startsWith('rl-other'))).toBe(false);
  });

  it('is safe when GA never started (a visitor who said no)', () => {
    const page = fakeHost('https://www.rothrocklegal.com/');
    expect(() => stopGa(page.host, 'G-TEST123')).not.toThrow();
    expect(page.win.dataLayer).toBeUndefined();
    expect(page.injected).toEqual([]);
  });
});

describe('clearGaCookies', () => {
  it('finds only GA4 cookies and skips domain attributes on localhost', () => {
    const writes: string[] = [];
    const doc = {
      get cookie() {
        return '_ga=1; _gallery=2; _ga_ABC=3';
      },
      set cookie(value: string) {
        writes.push(value);
      },
    };
    expect(clearGaCookies(doc, 'localhost')).toEqual(['_ga', '_ga_ABC']);
    expect(writes).toEqual(['_ga=; Max-Age=0; path=/', '_ga_ABC=; Max-Age=0; path=/']);
  });
});

describe('consentModeUpdate', () => {
  it('maps analytics to analytics_storage and advertising to the three ad types', () => {
    expect(consentModeUpdate(YES)).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(consentModeUpdate({ analytics: false, advertising: true })).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });
});
