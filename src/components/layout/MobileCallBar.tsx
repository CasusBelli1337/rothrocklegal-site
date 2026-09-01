"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneIcon } from "@/components/icons";
import { site } from "@/config/site";

/** Sticky two-half call bar under `lg`; hidden on /contact/ (HOMEPAGE-SPEC "Global"). */
export function MobileCallBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/contact")) return null;
  return (
    <>
      <div aria-hidden="true" className="h-14 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <a
          href={site.phoneHref}
          className="flex h-14 items-center justify-center gap-2 bg-maroon-700 text-[15px] font-semibold text-white"
        >
          <PhoneIcon className="h-4 w-4" />
          Call {site.phone}
        </a>
        <Link
          href="/contact/"
          className="flex h-14 items-center justify-center text-[15px] font-semibold text-maroon-700"
        >
          Tell us what happened
        </Link>
      </div>
    </>
  );
}
