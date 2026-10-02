'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { consentCopy } from '@/config/consent-copy';
import { closeConsentPanel, refreshConsent, saveConsent } from '@/lib/consent/client';
import { type ConsentState, DENIED } from '@/lib/consent/store';
import { useConsent, useHydrated } from '@/lib/consent/useConsent';
import { useBarInset } from './use-bar-inset';

/**
 * The bar's behavior: when it is open, the "Choose" panel, the saved-choice
 * announcement, focus on reopen (to the heading) and on close (back to the
 * link that opened it), and Escape.
 */
export function useConsentBar(placement: string) {
  const consent = useConsent();
  const hydrated = useHydrated();
  const [expanded, setExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const barRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = hydrated && (consent.needsChoice || consent.panelOpen);

  // The store's verdict wins over the boot script's, in case the two ever disagree.
  useEffect(() => refreshConsent(), []);
  useEffect(() => {
    if (!consent.panelOpen) return;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setExpanded(true);
    headingRef.current?.focus();
  }, [consent.panelOpen]);
  useBarInset(barRef, open, placement);

  /** A choice saves and closes; null only closes (a reopened bar's Close and Escape). */
  const finish = (choice: ConsentState | null) => {
    if (choice) {
      saveConsent(choice);
      setAnnouncement(consentCopy.saved);
    } else {
      closeConsentPanel();
    }
    setExpanded(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  };

  /** Escape declines a first visit; on a reopened bar it closes without changing anything. */
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    finish(consent.needsChoice ? DENIED : null);
  };

  return {
    consent,
    hydrated,
    open,
    reopened: consent.panelOpen && !consent.needsChoice,
    expanded,
    toggleExpanded: () => setExpanded((value) => !value),
    announcement,
    finish,
    onKeyDown,
    barRef,
    headingRef,
  };
}
