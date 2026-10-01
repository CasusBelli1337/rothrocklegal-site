'use client';

import { consentConfig, offeredCategories } from '@/config/consent';
import { privacyChoicesLabel } from '@/config/consent-copy';
import { openConsentPanel } from '@/lib/consent/client';
import { useConsent } from '@/lib/consent/useConsent';

interface PrivacyChoicesButtonProps {
  className?: string;
  /** Defaults to the footer link's name from config (config/consent-copy.ts). */
  children?: React.ReactNode;
}

/**
 * Reopens the privacy-choices bar with the categories showing. The footer
 * carries one on every page; once advertising runs, its name becomes "Do Not Sell
 * or Share My Personal Information" (config/consent-copy.ts).
 */
export function PrivacyChoicesButton({ className = '', children }: PrivacyChoicesButtonProps) {
  const { panelOpen, needsChoice } = useConsent();
  if (offeredCategories().length === 0) return null;
  return (
    <button
      type="button"
      aria-controls={consentConfig.barId}
      aria-expanded={panelOpen || needsChoice}
      onClick={openConsentPanel}
      className={`cursor-pointer ${className}`}
    >
      {children ?? privacyChoicesLabel()}
    </button>
  );
}
