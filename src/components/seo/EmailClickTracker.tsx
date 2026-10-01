'use client';

import { useEffect } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';

/** True when a click landed on (or inside) a mailto: link. */
export function isEmailLinkClick(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('a[href^="mailto:"]') !== null;
}

/**
 * Counts clicks on any mailto: link on the page (footer, contact band, bios, legal
 * pages) as `contact_email_click`. One listener on the document, so a new mailto:
 * link anywhere is counted without wiring. The address itself is never sent.
 */
export function EmailClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isEmailLinkClick(event.target)) trackEvent(ANALYTICS_EVENTS.contactEmailClick);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
