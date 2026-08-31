'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { asset, contactCta, nav, site } from '@/config/site';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4 lg:px-8">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="absolute top-0 left-4 z-40 bg-white p-3 shadow-md lg:left-16"
        >
          <Image src={asset('/images/logo.webp')} alt={site.name} width={130} height={95} priority />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-navy transition-colors hover:text-maroon-band"
            >
              {item.label}
            </Link>
          ))}
          <Link href={contactCta.href} className="btn-primary text-sm">
            {contactCta.label}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <Link href={contactCta.href} className="btn-primary text-xs">
            {contactCta.label}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          >
            <span className="h-0.5 w-6 bg-navy" />
            <span className="h-0.5 w-6 bg-navy" />
            <span className="h-0.5 w-6 bg-navy" />
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-gray-200 bg-white px-6 py-4 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
