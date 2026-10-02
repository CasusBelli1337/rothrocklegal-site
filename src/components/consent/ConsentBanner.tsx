'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { RefObject } from 'react';
import { showsMobileConsultBar } from '@/components/layout/consult-bar';
import { Container } from '@/components/ui/Container';
import { advertisingActive, consentConfig, offeredCategories } from '@/config/consent';
import { consentCopy, policyCounter, privacyChoicesLabel } from '@/config/consent-copy';
import { type ConsentState, DENIED, type PrivacySignal } from '@/lib/consent/store';
import { ConsentChoices } from './ConsentChoices';
import { barLinkClass, choiceButtonClass } from './styles';
import { useConsentBar } from './use-consent-bar';

const BAR_ID = consentConfig.barId;
const CATEGORIES_ID = `${BAR_ID}-categories`;
const ACCEPT_ANALYTICS: ConsentState = { analytics: true, advertising: false };

/**
 * Below `lg` the bar sits on top of the mobile consult bar where that shows (56px plus its 1px
 * top border). Written out for Tailwind's scanner.
 */
const ABOVE_CONSULT_BAR =
  'bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] lg:bottom-0 lg:pb-[env(safe-area-inset-bottom)]';
const AT_BOTTOM = 'bottom-0 pb-[env(safe-area-inset-bottom)]';
const BAR_CLASS =
  'fixed inset-x-0 z-40 max-h-[85dvh] overflow-y-auto border-t-2 border-brass-400 bg-paper ' +
  'shadow-[0_-12px_32px_rgb(27_24_22/0.14)]';

function Message({
  signal,
  headingRef,
}: {
  signal: PrivacySignal;
  headingRef: RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p id={`${BAR_ID}-heading`} ref={headingRef} tabIndex={-1} className="eyebrow outline-none">
        {consentCopy.eyebrow}
      </p>
      <p className="mt-2 text-body text-ink">
        {advertisingActive() ? consentCopy.messageWithAdvertising : consentCopy.message}
      </p>
      {signal && (
        <p className="mt-2 text-body text-ink-2">
          {consentCopy.signalNote(consentCopy.signalNames[signal])}
        </p>
      )}
    </div>
  );
}

interface ButtonsProps {
  expanded: boolean;
  onToggle: () => void;
  finish: (choice: ConsentState) => void;
}

/**
 * Three equal-weight choices (CCPA regs § 7004(a)(2)): same size, same color. Side by side;
 * with a larger text size on a phone the third wraps to its own row rather than overflow.
 */
function Choices({ expanded, onToggle, finish }: ButtonsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2 lg:w-[31rem] lg:shrink-0 lg:grid-cols-3">
      <button type="button" onClick={() => finish(ACCEPT_ANALYTICS)} className={choiceButtonClass}>
        {consentCopy.accept}
      </button>
      <button type="button" onClick={() => finish(DENIED)} className={choiceButtonClass}>
        {consentCopy.decline}
      </button>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={CATEGORIES_ID}
        onClick={onToggle}
        className={choiceButtonClass}
      >
        {consentCopy.choose}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

/** The small print; it also notes the firm's own count, which is not a choice here (docs/CONSENT.md). */
function SmallPrint({ onClose }: { onClose?: () => void }) {
  const counter = policyCounter();
  return (
    <p className="mt-3 text-body text-ink-3">
      {consentCopy.changeLater(privacyChoicesLabel())} {counter && `${counter.barNote} `}
      <Link href="/privacy-policy/#cookies-and-your-choices" className={barLinkClass}>
        {consentCopy.policyLink}
      </Link>
      {onClose && (
        <button type="button" onClick={onClose} className={`${barLinkClass} ml-4`}>
          {consentCopy.close}
        </button>
      )}
    </p>
  );
}

/**
 * The privacy-choices bar (docs/CONSENT.md). On a first visit it is fixed to the
 * bottom of the screen, stacked above the mobile consult bar, with three
 * equal-weight choices; "Choose" opens the categories inline, never as a modal.
 * Before hydration the CSS shows it only under html[data-consent="ask"] (stamped
 * by the boot script), so it never flashes for a returning visitor and stays
 * hidden without JavaScript, when no tracker can run anyway.
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const position = showsMobileConsultBar(pathname) ? ABOVE_CONSULT_BAR : AT_BOTTOM;
  const bar = useConsentBar(position);
  if (offeredCategories().length === 0) return null;
  return (
    <>
      <section
        id={BAR_ID}
        ref={bar.barRef}
        data-consent-bar=""
        data-open={bar.open ? '' : undefined}
        hidden={bar.hydrated && !bar.open}
        aria-labelledby={`${BAR_ID}-heading`}
        onKeyDown={bar.onKeyDown}
        className={`${BAR_CLASS} ${position}`}
      >
        <Container className="py-3 sm:py-4 lg:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-10">
            <Message signal={bar.consent.signal} headingRef={bar.headingRef} />
            <Choices expanded={bar.expanded} onToggle={bar.toggleExpanded} finish={bar.finish} />
          </div>
          {bar.expanded && (
            <ConsentChoices
              id={CATEGORIES_ID}
              initial={bar.consent.state}
              signal={bar.consent.signal}
              onSave={bar.finish}
            />
          )}
          <SmallPrint onClose={bar.reopened ? () => bar.finish(null) : undefined} />
        </Container>
      </section>
      <p role="status" className="sr-only">
        {bar.announcement}
      </p>
    </>
  );
}
