'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { consultCta } from '@/config/site';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

/** Pages that carry their own primary action (or a signature block); the bar would only cover their form. */
const HIDDEN_ON = ['/contact/', consultCta.href, ...PUBLIC_LINK_PATHS].map((href) =>
  href.replace(/\/$/, ''),
);

/** Text-entry controls open the on-screen keyboard, which would push the bar over the field. */
function opensKeyboard(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement) return true;
  return (
    target instanceof HTMLInputElement &&
    !/^(radio|checkbox|file|button|submit|range|color)$/.test(target.type)
  );
}

/** True while a text field has focus. Mobile keyboards resize only the visual viewport, so a fixed bar stays put on top of the field. */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => setOpen(opensKeyboard(event.target));
    const onFocusOut = () => setOpen(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);
  return open;
}

/** Sticky full-width consult button under `lg` (HOMEPAGE-SPEC "Global"; consult-first per Arthur, 2026-09-01). */
export function MobileConsultBar() {
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();
  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;
  return (
    <>
      {/* Reserves the bar plus the home-indicator inset, so the footer's last line is never covered. */}
      <div aria-hidden="true" className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden" />
      {/* A landmark, so the bar is reachable by region navigation and axe's "content in landmarks" rule holds. */}
      <nav
        aria-label="Quick action"
        hidden={keyboardOpen}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <Link
          href={consultCta.href}
          className="flex h-14 items-center justify-center bg-maroon-700 text-ui font-semibold text-white"
        >
          {consultCta.label}
        </Link>
      </nav>
    </>
  );
}
