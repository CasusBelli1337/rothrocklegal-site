'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { MenuIcon } from '@/components/icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { consultCta, nav, site } from '@/config/site';
import { MobileMenu } from './MobileMenu';
import { isActive, navLinkClass } from './nav-link';
import { NavDropdown } from './NavDropdown';
import { ReadingOptionsBar, ReadingOptionsButton } from './ReadingOptions';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const closeReading = useCallback(() => setReadingOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      // Above the z-40 consult bar so the mobile sheet (rendered inside this stacking context) covers it.
      className={`sticky top-0 z-50 border-b border-line transition-colors duration-150 ${
        scrolled ? 'bg-paper/90 backdrop-blur' : 'bg-paper'
      }`}
    >
      <Container className="flex h-[60px] items-center justify-between gap-6 lg:h-[72px]">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="flex min-h-11 shrink-0 items-center rounded-md"
        >
          <BrandLogo
            lockup="horizontal"
            tone="maroon"
            alt=""
            priority
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) =>
            item.children ? (
              <NavDropdown key={item.href} item={item} active={isActive(pathname, item)} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActive(pathname, item))}
                aria-current={isActive(pathname, item) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ReadingOptionsButton open={readingOpen} onToggle={() => setReadingOpen((v) => !v)} />
          <Button href={consultCta.href} size="sm">
            {consultCta.label}
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ReadingOptionsButton
            open={readingOpen}
            onToggle={() => setReadingOpen((v) => !v)}
            size="compact"
          />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-md text-ink"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </Container>

      {/* In the flow under the row: opening it pushes the page down instead of covering it. */}
      <ReadingOptionsBar open={readingOpen} onClose={closeReading} />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </header>
  );
}
