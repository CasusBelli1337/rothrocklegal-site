import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { gaLoaderScript } from './tag';

/** Runs the loader against a fake page at `href`; returns what it queued and injected. */
function run(href: string) {
  const injected: { src: string; async: boolean }[] = [];
  const window: { dataLayer?: unknown[][]; gtag?: unknown } = {};
  const context = {
    window,
    location: new URL(href),
    URL,
    Date,
    document: {
      createElement: () => ({ src: '', async: false }),
      head: { appendChild: (el: { src: string; async: boolean }) => injected.push(el) },
    },
    get gtag() {
      return window.gtag;
    },
  };
  runInNewContext(gaLoaderScript('G-TEST123'), context);
  const calls = (window.dataLayer ?? []).map((args) => Array.from(args));
  return { calls, injected };
}

describe('gaLoaderScript', () => {
  it('configures the stream and loads gtag.js once on an ordinary page', () => {
    const { calls, injected } = run('https://www.rothrocklegal.com/trust-contests/');
    expect(calls.map((c) => c[0])).toEqual(['js', 'config']);
    expect(calls[1]).toEqual(['config', 'G-TEST123', {}]);
    expect(injected).toHaveLength(1);
    expect(injected[0]).toMatchObject({
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    });
  });

  it('never runs on the emailed-link pages', () => {
    for (const path of ['/sign/?t=abc', '/schedule/?t=abc']) {
      const { calls, injected } = run(`https://www.rothrocklegal.com${path}`);
      expect(calls).toEqual([]);
      expect(injected).toEqual([]);
    }
  });

  it('reports a resume landing without its one-use token', () => {
    const { calls } = run(
      'https://www.rothrocklegal.com/request-a-consult/?resume=secret-token&utm_source=email',
    );
    expect(calls[1]).toEqual([
      'config',
      'G-TEST123',
      { page_location: 'https://www.rothrocklegal.com/request-a-consult/?utm_source=email' },
    ]);
    expect(JSON.stringify(calls)).not.toContain('secret-token');
  });
});
