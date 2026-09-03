'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuIcon } from '@/components/icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { consultCta, nav, site } from '@/config/site';
import { MobileMenu } from './MobileMenu';
import { headerColumnClass, isActive, navLinkClass } from './nav-link';
import { NavDropdown } from './NavDropdown';
import {
  ReadingOptionsBar,
  ReadingOptionsIconButton,
  ReadingOptionsNavButton,
} from './ReadingOptions';

interface ReadingProps {
  readingOpen: boolean;
  onToggleReading: () => void;
}

/**
 * The five nav items, then Reading options. The full row needs about 1,300px at
 * this type size, so it starts at xl and runs tight until 1440px (min-[90rem]):
 * closer items and no icon on Reading options until then.
 */
function MainNav({ pathname, readingOpen, onToggleReading }: ReadingProps & { pathname: string }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-4 xl:flex min-[90rem]:gap-6">
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
      <ReadingOptionsNavButton open={readingOpen} onToggle={onToggleReading} />
    </nav>
  );
}

/** Below xl: the Reading options icon and the menu button, 44px each. */
function CompactControls({
  readingOpen,
  onToggleReading,
  menuOpen,
  onOpenMenu,
}: ReadingProps & { menuOpen: boolean; onOpenMenu: () => void }) {
  return (
    <div className="flex items-center gap-1 xl:hidden">
      <ReadingOptionsIconButton open={readingOpen} onToggle={onToggleReading} />
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="grid h-11 w-11 place-items-center rounded-md text-ink"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Moving to another page closes the bar; the reader's choices are already saved.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setReadingOpen(false);
  }, [pathname]);

  const toggleReading = useCallback(() => setReadingOpen((value) => !value), []);
  const closeReading = useCallback(() => setReadingOpen(false), []);

  return (
    <header
      // Above the z-40 consult bar so the mobile sheet (rendered inside this stacking context) covers it.
      className={`sticky top-0 z-50 border-b border-line transition-colors duration-150 ${
        scrolled ? 'bg-paper/90 backdrop-blur' : 'bg-paper'
      }`}
    >
      <div
        className={`${headerColumnClass} flex h-[60px] items-center justify-between gap-6 xl:h-[72px]`}
      >
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
            className="h-9 w-auto xl:h-10 min-[90rem]:h-11"
          />
        </Link>

        <MainNav pathname={pathname} readingOpen={readingOpen} onToggleReading={toggleReading} />

        {/* From lg the compact row carries the consult button (MobileConsultBar hands off there). */}
        <div className="hidden items-center lg:ml-auto lg:flex xl:ml-0">
          <Button href={consultCta.href} size="sm">
            {consultCta.label}
          </Button>
        </div>

        <CompactControls
          readingOpen={readingOpen}
          onToggleReading={toggleReading}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
        />
      </div>

      {/* In normal flow under the nav row: it pushes the page down and covers nothing. */}
      <ReadingOptionsBar open={readingOpen} onClose={closeReading} />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </header>
  );
}
