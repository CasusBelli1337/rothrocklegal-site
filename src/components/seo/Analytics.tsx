import Script from 'next/script';
import { site } from '@/config/site';
import { analyticsEnabled } from '@/lib/analytics/events';
import { gaLoaderScript } from '@/lib/analytics/tag';
import { EmailClickTracker } from './EmailClickTracker';

/**
 * The Google Analytics 4 tag, the one third-party script on the site (privacy
 * policy, "Technical information"). Off when site.analyticsId is blank and in
 * the editor preview, so Arthur's editing never counts as a visit. It loads once
 * the page is idle (SEO-SPEC §11), never on the emailed-link pages, and never
 * with a one-use token in the address (lib/analytics/tag). Enhanced measurement
 * on the stream reports the App Router's client-side navigations; the four
 * events in lib/analytics/events are sent by the pages that own them.
 */
export function Analytics() {
  if (!analyticsEnabled()) return null;
  return (
    <>
      <Script id="ga4" strategy="lazyOnload">
        {gaLoaderScript(site.analyticsId)}
      </Script>
      <EmailClickTracker />
    </>
  );
}
