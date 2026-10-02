import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { site } from '@/config/site';
import type { CounterConfig } from '@/lib/analytics/counter';
import { Counter } from './Counter';

const route = { pathname: '/' };
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

/** The static HTML the export would carry for `pathname`. */
function htmlAt(pathname: string, config: CounterConfig = site.counter): string {
  route.pathname = pathname;
  return renderToStaticMarkup(<Counter config={config} />);
}

afterEach(() => vi.unstubAllEnvs());

describe('Counter', () => {
  it('puts the loader in the static HTML of a public page, pointing at the counter host', () => {
    const html = htmlAt('/trust-contests/');
    expect(html).toMatch(/^<script data-counter="">\(function\(\)\{/);
    expect(html).toContain(`${site.counter.origin}/c.js`);
    expect(html).toContain(site.counter.websiteId);
    expect(html).toContain('"data-do-not-track":"true"');
    expect(html).toContain('"data-auto-track":"true"');
  });

  it('never renders on the emailed-link pages', () => {
    for (const path of ['/sign/', '/sign', '/schedule/', '/schedule']) {
      expect(htmlAt(path)).toBe('');
    }
  });

  it('renders nothing when the counter is blank in config', () => {
    expect(htmlAt('/', { origin: '', websiteId: '' })).toBe('');
    expect(htmlAt('/', { origin: '', websiteId: site.counter.websiteId })).toBe('');
  });

  it('renders nothing in the editor preview', () => {
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_TOOLS', '1');
    expect(htmlAt('/')).toBe('');
  });
});
