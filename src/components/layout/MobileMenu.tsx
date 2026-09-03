'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ChevronDownIcon, CloseIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { asset, consultCta, nav, noteCta, site, type NavItem } from '@/config/site';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

function MenuGroup({ item, onClose }: { item: NavItem; onClose: () => void }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium text-ink">
        {item.label}
        <ChevronDownIcon className="h-5 w-5 text-brass-500 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <ul className="pb-3">
        {item.children?.map((child) => (
          <li key={child.href}>
            <Link href={child.href} onClick={onClose} className="block rounded-md py-2.5 pl-3">
              <span className="block text-ui font-medium text-ink">{child.label}</span>
              <span className="block text-small text-ink-3">{child.sublabel}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={item.href}
            onClick={onClose}
            className="block py-3 pl-3 text-ui font-semibold text-maroon-700"
          >
            All practice areas
          </Link>
        </li>
      </ul>
    </details>
  );
}

/** Keeps Tab inside the dialog: an aria-modal sheet must not let focus wander into the page behind it. */
function trapFocus(event: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return;
  const items = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button, summary')).filter(
    (el) => el.offsetParent !== null,
  );
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !dialog.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Full-height sheet from the right; consult + note buttons pinned at the bottom (DESIGN-BRIEF §5). */
export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    // Lock both roots: iOS Safari keeps scrolling the page when only <body> is hidden.
    const root = document.documentElement;
    const previous = { html: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') trapFocus(event, dialogRef.current);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      root.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      ref={dialogRef}
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-maroon-950/50 touch-none"
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] animate-sheet-in flex-col bg-paper shadow-xl">
        <div className="flex h-[60px] items-center justify-between border-b border-line px-5">
          <Image
            src={asset('/images/logo.webp')}
            alt={site.name}
            width={48}
            height={35}
            className="h-9 w-auto"
          />
          <button
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-md text-ink"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-5">
          {nav.map((item) =>
            item.children ? (
              <MenuGroup key={item.href} item={item} onClose={onClose} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block border-b border-line py-4 text-lg font-medium text-ink"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="grid gap-3 border-t border-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <Button href={consultCta.href}>{consultCta.label}</Button>
          <Button variant="secondary" href={noteCta.href}>
            {noteCta.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
