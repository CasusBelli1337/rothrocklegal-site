import { site } from '@/config/site';
import { analyticsEnabled } from '@/lib/analytics/events';
import { EmailClickTracker } from './EmailClickTracker';
import { GaLoader } from './GaLoader';

/**
 * Google Analytics 4, the one third-party script on the site (privacy policy,
 * "Technical information" and "Cookies and your choices"). Off when
 * site.analyticsId is blank and in the editor preview, so Arthur's editing never
 * counts as a visit. Consent first (docs/CONSENT.md): no Google script loads, and
 * no event is sent, until the visitor says yes to analytics in the privacy-choices
 * bar. After a yes it loads once the page is idle (SEO-SPEC §11), never on the
 * emailed-link pages, and never with a one-use token in the address
 * (lib/analytics/tag). The four events in lib/analytics/events are sent by the
 * pages that own them.
 */
export function Analytics() {
  if (!analyticsEnabled()) return null;
  return (
    <>
      <GaLoader measurementId={site.analyticsId} />
      <EmailClickTracker />
    </>
  );
}
