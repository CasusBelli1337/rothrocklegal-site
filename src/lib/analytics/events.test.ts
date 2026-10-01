import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_EVENTS, analyticsEnabled, trackEvent } from './events';

/** Every non-test source file under src/ (the #seam:ga4-events drift guard reads them). */
function sources(dir = path.join(process.cwd(), 'src')): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

type TestWindow = { gtag?: (...args: unknown[]) => void };

function withWindow(gtag?: TestWindow['gtag']) {
  vi.stubGlobal('window', { gtag } satisfies TestWindow);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('ANALYTICS_EVENTS', () => {
  it('uses GA4-valid names (snake_case, starts with a letter, 40 characters or fewer)', () => {
    for (const name of Object.values(ANALYTICS_EVENTS)) {
      expect(name).toMatch(/^[a-z][a-z0-9_]{0,39}$/);
    }
  });

  // #seam:ga4-events: an event defined here and sent from nowhere is a dead key event in GA4.
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

  it('stays off in the editor preview', () => {
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_TOOLS', '1');
    const gtag = vi.fn();
    withWindow(gtag);
    expect(analyticsEnabled()).toBe(false);
    trackEvent(ANALYTICS_EVENTS.deadlineWizardCompleted);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does nothing on the server', () => {
    expect(() => trackEvent(ANALYTICS_EVENTS.consultStarted)).not.toThrow();
  });
});
