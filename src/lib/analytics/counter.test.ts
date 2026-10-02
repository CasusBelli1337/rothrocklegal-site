import { afterEach, describe, expect, it, vi } from 'vitest';
import { site } from '@/config/site';
import { privacySignal } from '@/lib/consent/store';
import {
  type CounterConfig,
  counterAllowedOn,
  counterAttributes,
  counterConfigured,
  counterEnabled,
  counterLoaderScript,
} from './counter';

const CONFIG: CounterConfig = {
  origin: 'https://count.example.com',
  websiteId: '00000000-0000-4000-8000-000000000000',
};

interface FakeScript {
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
}

/** Runs the inline loader against a fake page; `load()` fires the load event. */
function runLoader(
  navigator: object,
  readyState = 'complete',
  script = counterLoaderScript(CONFIG),
) {
  const appended: FakeScript[] = [];
  const listeners: Array<() => void> = [];
  const document = {
    readyState,
    head: { appendChild: (el: FakeScript) => appended.push(el) },
    createElement: (): FakeScript => {
      const attributes: Record<string, string> = {};
      return { attributes, setAttribute: (name, value) => void (attributes[name] = value) };
    },
  };
  const addEventListener = (type: string, fn: () => void) => {
    if (type === 'load') listeners.push(fn);
  };
  new Function('navigator', 'document', 'addEventListener', script)(
    navigator,
    document,
    addEventListener,
  );
  return { appended, load: () => listeners.forEach((fn) => fn()) };
}

const SIGNALS: Record<string, object> = {
  none: {},
  gpc: { globalPrivacyControl: true },
  dnt: { doNotTrack: '1' },
  'both off': { doNotTrack: '0', globalPrivacyControl: false },
  'gpc as a string': { globalPrivacyControl: 'true' },
};

afterEach(() => vi.unstubAllEnvs());

describe('counter config', () => {
  it('is filled in for the live site, on a subdomain of the firm domain', () => {
    expect(counterConfigured()).toBe(true);
    expect(new URL(site.counter.origin).hostname).toBe('count.rothrocklegal.com');
    expect(site.counter.websiteId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('means no tag when the origin or the website id is blank', () => {
    expect(counterEnabled({ origin: '', websiteId: CONFIG.websiteId })).toBe(false);
    expect(counterEnabled({ origin: CONFIG.origin, websiteId: '' })).toBe(false);
    expect(counterEnabled(CONFIG)).toBe(true);
  });

  it('stays off in the editor preview, where the policy still describes it', () => {
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_TOOLS', '1');
    expect(counterEnabled(CONFIG)).toBe(false);
    expect(counterConfigured(CONFIG)).toBe(true);
  });
});

describe('counterAllowedOn', () => {
  it('runs on public pages and never on the emailed-link pages', () => {
    for (const path of ['/', '/trust-contests', '/trust-contests/', '/library/some-article/']) {
      expect(counterAllowedOn(path)).toBe(true);
    }
    for (const path of ['/sign', '/sign/', '/schedule', '/schedule/']) {
      expect(counterAllowedOn(path)).toBe(false);
    }
  });
});

describe('counterAttributes', () => {
  it('builds the Umami tag: the tracker, the id, Do Not Track, auto-track, no query or hash', () => {
    expect(counterAttributes(CONFIG, 'https://www.rothrocklegal.com')).toEqual({
      src: 'https://count.example.com/c.js',
      defer: '',
      'data-website-id': CONFIG.websiteId,
      'data-domains': 'www.rothrocklegal.com',
      'data-do-not-track': 'true',
      'data-auto-track': 'true',
      'data-exclude-search': 'true',
      'data-exclude-hash': 'true',
    });
  });
});

describe('counterLoaderScript', () => {
  it('appends one tracker with every attribute once the page has loaded', () => {
    const page = runLoader({}, 'loading');
    expect(page.appended).toEqual([]);
    page.load();
    expect(page.appended).toHaveLength(1);
    expect(page.appended[0].attributes).toEqual(counterAttributes(CONFIG));
  });

  it('appends at once when the page has already loaded', () => {
    expect(runLoader({}).appended).toHaveLength(1);
  });

  it('loads nothing, not even the script, under Global Privacy Control or Do Not Track', () => {
    for (const nav of [{ globalPrivacyControl: true }, { doNotTrack: '1' }]) {
      const page = runLoader(nav, 'loading');
      page.load();
      expect(page.appended).toEqual([]);
    }
  });

  it('reads the signals exactly as the consent store does', () => {
    for (const [name, nav] of Object.entries(SIGNALS)) {
      const loads = runLoader(nav).appended.length === 1;
      expect({ name, loads }).toEqual({ name, loads: privacySignal(nav) === null });
    }
  });

  it('stays small, calls nothing itself, and names no Google host', () => {
    const script = counterLoaderScript(CONFIG);
    expect(Buffer.byteLength(script)).toBeLessThan(600);
    expect(script).not.toMatch(/fetch|XMLHttpRequest|cookie|localStorage|google/i);
  });
});
