'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRightIcon, ChevronDownIcon } from '@/components/icons';
import type { NavItem } from '@/config/site';
import { navLinkClass } from './nav-link';

interface NavDropdownProps {
  item: NavItem;
  active: boolean;
}

function focusables(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>('a[href]')) : [];
}

/** A touch tablet in landscape shows this desktop nav too; there, only a tap should open the panel. */
const canHover = () => window.matchMedia('(hover: hover)').matches;

/**
 * Desktop "Trust & Estate Litigation" panel: opens on hover and click/Enter,
 * closes on Esc and outside click, arrow keys move focus (DESIGN-BRIEF §5).
 */
export function NavDropdown({ item, active }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** True while the pointer is over the trigger, so a mouse click keeps the hover-opened panel open. */
  const hovering = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function moveFocus(event: React.KeyboardEvent, delta: 1 | -1) {
    const links = focusables(panelRef.current);
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLElement);
    const next =
      index === -1
        ? delta === 1
          ? 0
          : links.length - 1
        : (index + delta + links.length) % links.length;
    links[next].focus();
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      setOpen(true);
      requestAnimationFrame(() => focusables(panelRef.current)[0]?.focus());
      event.preventDefault();
    }
  }

  function onPanelKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') moveFocus(event, 1);
    if (event.key === 'ArrowUp') moveFocus(event, -1);
    if (event.key === 'Tab' && !event.shiftKey) {
      const links = focusables(panelRef.current);
      if (document.activeElement === links[links.length - 1]) setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        if (!canHover()) return;
        hovering.current = true;
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (!canHover()) return;
        hovering.current = false;
        setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen((value) => hovering.current || !value)}
        onKeyDown={onTriggerKeyDown}
        className={navLinkClass(active)}
      >
        {item.label}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        onKeyDown={onPanelKeyDown}
        className="absolute left-1/2 top-full z-50 w-[42rem] -translate-x-1/2 pt-2"
      >
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-3 shadow-md">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 transition-colors hover:bg-sand focus-visible:bg-sand focus-visible:outline-none"
            >
              <span className="block text-ui font-medium text-ink">{child.label}</span>
              <span className="mt-0.5 block text-small text-ink-3">{child.sublabel}</span>
            </Link>
          ))}
          <Link
            href={item.href}
            onClick={() => setOpen(false)}
            className="col-span-2 mt-1 inline-flex items-center gap-2 border-t border-line px-3 pb-1 pt-3 text-ui font-semibold text-maroon-700 hover:text-maroon-600"
          >
            All practice areas
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
