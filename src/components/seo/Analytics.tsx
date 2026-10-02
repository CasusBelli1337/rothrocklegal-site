import { site } from '@/config/site';
import { counterEnabled } from '@/lib/analytics/counter';
import { analyticsEnabled } from '@/lib/analytics/events';
import { Counter } from './Counter';
import { EmailClickTracker } from './EmailClickTracker';
import { GaLoader } from './GaLoader';

/**
 * The two ways the site counts visits (privacy policy, "Technical information").
 * Google Analytics 4, the one third-party script, is consent first
 * (docs/CONSENT.md): no Google script loads, and no event is sent, until the
 * visitor says yes in the privacy-choices bar; after a yes it loads once the page
 * is idle (SEO-SPEC §11), never on the emailed-link pages, and never with a one-use
 * token in the address (lib/analytics/tag). The firm's own counter (Counter,
 * site.counter) is first party and cookieless and runs without the bar, but never
 * under a privacy signal or on the emailed-link pages. Both are off in the editor
 * preview, so Arthur's editing never counts as a visit. The four events in
 * lib/analytics/events go to both, sent by the pages that own them.
 */
export function Analytics() {
  const ga = analyticsEnabled();
  if (!ga && !counterEnabled()) return null;
  return (
    <>
      {ga && <GaLoader measurementId={site.analyticsId} />}
      <Counter />
      <EmailClickTracker />
    </>
  );
}
