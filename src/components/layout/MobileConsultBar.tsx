'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { consultCta, noteCta } from '@/config/site';

/** Pages that carry their own primary action; the bar would only cover their form. */
const HIDDEN_ON = [noteCta.href, consultCta.href].map((href) => href.replace(/\/$/, ''));

/** Sticky full-width consult button under `lg` (HOMEPAGE-SPEC "Global"; consult-first per Arthur, 2026-09-01). */
export function MobileConsultBar() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;
  return (
    <>
      <div aria-hidden="true" className="h-14 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <Link
          href={consultCta.href}
          className="flex h-14 items-center justify-center bg-maroon-700 text-[15px] font-semibold text-white"
        >
          {consultCta.label}
        </Link>
      </div>
    </>
  );
}
