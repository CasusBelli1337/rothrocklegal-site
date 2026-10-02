'use client';

import { usePathname } from 'next/navigation';
import { site } from '@/config/site';
import {
  type CounterConfig,
  counterAllowedOn,
  counterEnabled,
  counterLoaderScript,
} from '@/lib/analytics/counter';

/**
 * The firm's own visit counter (docs/CONSENT.md "First-party counter"): Umami on
 * the firm's server, no cookie, nothing stored in the browser, no IP kept. First
 * party and cookieless, so it does not wait for the privacy-choices bar (Arthur,
 * 2026-10-01); the inline loader skips it under Global Privacy Control or Do Not
 * Track. Rendered into the static HTML of every page but /sign/ and /schedule/, so
 * scripts/check-consent.mjs can see exactly where it runs. Off in the editor
 * preview and when site.counter is blank.
 */
export function Counter({ config = site.counter }: { config?: CounterConfig }) {
  const pathname = usePathname();
  if (!counterEnabled(config) || !counterAllowedOn(pathname)) return null;
  return (
    <script data-counter="" dangerouslySetInnerHTML={{ __html: counterLoaderScript(config) }} />
  );
}
