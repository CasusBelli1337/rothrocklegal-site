import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshConsent } from '@/lib/consent/client';
import { recordOf, storageWith } from '@/lib/consent/testing';
import { ANALYTICS_EVENTS, analyticsEnabled, trackEvent } from './events';

/** Every non-test source file under src/ (the #seam:ga4-events drift guard reads them). */
function sources(dir = path.join(process.cwd(), 'src')): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

type TestWindow = {
  gtag?: (...args: unknown[]) => void;
  umami?: { track: (...args: unknown[]) => unknown };
};

function withWindow(gtag?: TestWindow['gtag'], umami?: TestWindow['umami']) {
  vi.stubGlobal('window', { gtag, umami } satisfies TestWindow);
}

/** The visitor's stored choice (or none) and privacy signal, as the consent store will read them. */
function withConsent(record: unknown, navigator: object = {}) {
  vi.stubGlobal('localStorage', record === null ? storageWith(null) : storageWith(record));
  vi.stubGlobal('navigator', navigator);
  refreshConsent();
}

beforeEach(() => withConsent(recordOf({ granted: ['analytics'] })));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  refreshConsent();
});

describe('ANALYTICS_EVENTS', () => {
  it('uses GA4-valid names (snake_case, starts with a letter, 40 characters or fewer)', () => {
    for (const name of Object.values(ANALYTICS_EVENTS)) {
      expect(name).toMatch(/^[a-z][a-z0-9_]{0,39}$/);
    }
  });

  // #seam:ga4-events: an event defined here and sent from nowhere is a dead key event in GA4
  // and an empty row in the counter.
  it('is sent from somewhere in the site for every event', () => {
    const code = sources()
      .filter((f) => !f.endsWith(path.join('analytics', 'events.ts')))
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');
    for (const key of Object.keys(ANALYTICS_EVENTS)) {
      expect(code).toContain(`trackEvent(ANALYTICS_EVENTS.${key})`);
    }
  });
});

describe('trackEvent', () => {
  it('sends the event name and nothing else, so no personal data can ride along', () => {
    const gtag = vi.fn();
    withWindow(gtag);
    trackEvent(ANALYTICS_EVENTS.consultSubmitted);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0]).toEqual(['event', 'consult_submitted']);
  });

  it('does nothing when the tag has not loaded or is blocked', () => {
    withWindow(undefined);
    expect(() => trackEvent(ANALYTICS_EVENTS.consultStarted)).not.toThrow();
  });

  it('never throws when gtag itself fails', () => {
    withWindow(() => {
      throw new Error('blocked');
    });
    expect(() => trackEvent(ANALYTICS_EVENTS.contactEmailClick)).not.toThrow();
  });

  it('stays off in the editor preview, for both senders', () => {
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_TOOLS', '1');
    const gtag = vi.fn();
    const umami = { track: vi.fn() };
    withWindow(gtag, umami);
    expect(analyticsEnabled()).toBe(false);
    trackEvent(ANALYTICS_EVENTS.deadlineWizardCompleted);
    expect(gtag).not.toHaveBeenCalled();
    expect(umami.track).not.toHaveBeenCalled();
  });

  it('drops the event (never queues it) before the visitor has chosen', () => {
    withConsent(null);
    const gtag = vi.fn();
    withWindow(gtag);
    trackEvent(ANALYTICS_EVENTS.consultStarted);
    expect(gtag).not.toHaveBeenCalled();
    // A later yes does not replay what was dropped.
    withConsent(recordOf({ granted: ['analytics'] }));
    expect(gtag).not.toHaveBeenCalled();
  });

  it('drops the event after a decline', () => {
    withConsent(recordOf({ granted: [] }));
    const gtag = vi.fn();
    withWindow(gtag);
    trackEvent(ANALYTICS_EVENTS.consultSubmitted);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('drops the event when a privacy signal appeared after the yes', () => {
    withConsent(recordOf({ granted: ['analytics'], signal: false }), {
      globalPrivacyControl: true,
    });
    const gtag = vi.fn();
    withWindow(gtag);
    trackEvent(ANALYTICS_EVENTS.deadlineWizardCompleted);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does nothing on the server', () => {
    expect(() => trackEvent(ANALYTICS_EVENTS.consultStarted)).not.toThrow();
  });
});

describe('trackEvent and the counter', () => {
  it('sends every event to both senders, by name alone', () => {
    const gtag = vi.fn();
    const umami = { track: vi.fn() };
    withWindow(gtag, umami);
    for (const name of Object.values(ANALYTICS_EVENTS)) trackEvent(name);
    const names = Object.values(ANALYTICS_EVENTS);
    expect(gtag.mock.calls).toEqual(names.map((name) => ['event', name]));
    expect(umami.track.mock.calls).toEqual(names.map((name) => [name]));
  });

  it('counts in the counter without a yes to analytics, which still keeps Google out', () => {
    for (const record of [null, recordOf({ granted: [] })]) {
      withConsent(record);
      const gtag = vi.fn();
      const umami = { track: vi.fn() };
      withWindow(gtag, umami);
      trackEvent(ANALYTICS_EVENTS.consultSubmitted);
      expect(gtag).not.toHaveBeenCalled();
      expect(umami.track.mock.calls).toEqual([['consult_submitted']]);
    }
  });

  it('does nothing in the counter where the tracker never loaded (a privacy signal, /sign/)', () => {
    const gtag = vi.fn();
    withWindow(gtag, undefined);
    expect(() => trackEvent(ANALYTICS_EVENTS.consultStarted)).not.toThrow();
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it('never throws when the counter itself fails, and GA still gets the event', () => {
    const gtag = vi.fn();
    withWindow(gtag, {
      track: () => {
        throw new Error('blocked');
      },
    });
    expect(() => trackEvent(ANALYTICS_EVENTS.contactEmailClick)).not.toThrow();
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});
