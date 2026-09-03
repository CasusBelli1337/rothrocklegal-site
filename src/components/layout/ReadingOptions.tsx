'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { headerColumnClass, navButtonClass } from './nav-link';
import { ReadingOptionGroups } from './ReadingOptionGroups';

export const READING_OPTIONS_ID = 'reading-options';

/** Two letter A's, small and large: the type-size glyph readers know from e-readers. */
function TextSizeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 18 4-10 4 10M4.6 14h4.8" />
      <path d="m12 18 5-13 5 13M13.9 13h6.2" />
    </svg>
  );
}

interface ButtonProps {
  open: boolean;
  onToggle: () => void;
}

/** Both buttons carry this marker so the bar can hand focus back to whichever one is on screen. */
const buttonAttrs = (open: boolean) => ({
  type: 'button' as const,
  'aria-expanded': open,
  'aria-controls': READING_OPTIONS_ID,
  'data-reading-options-button': true,
});

/** Desktop: the last item in the main nav, icon plus label, styled like the links around it. */
export function ReadingOptionsNavButton({ open, onToggle }: ButtonProps) {
  return (
    <button {...buttonAttrs(open)} onClick={onToggle} className={navButtonClass(open)}>
      {/* The row is tight between 1280 and 1439px; the icon joins the label once there is room. */}
      <TextSizeIcon className="hidden h-5 w-5 min-[90rem]:block" />
      Reading options
    </button>
  );
}

/** Phones and tablets: a 44px icon button beside the menu button. */
export function ReadingOptionsIconButton({ open, onToggle }: ButtonProps) {
  return (
    <button
      {...buttonAttrs(open)}
      aria-label="Reading options"
      onClick={onToggle}
      className={`grid h-11 w-11 place-items-center text-ink transition-colors duration-150 ${
        open ? 'bg-sand' : ''
      }`}
    >
      <TextSizeIcon className="h-6 w-6" />
    </button>
  );
}

function focusVisibleButton() {
  Array.from(document.querySelectorAll<HTMLElement>('[data-reading-options-button]'))
    .find((el) => el.offsetParent !== null)
    ?.focus();
}

interface BarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The bar under the nav row, inside the sticky header. It is in the document
 * flow, so it pushes the page down and never covers anything. Escape and Done
 * close it and put focus back on the button that opened it.
 */
export function ReadingOptionsBar({ open, onClose }: BarProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onClose();
      focusVisibleButton();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const done = () => {
    onClose();
    focusVisibleButton();
  };

  return (
    <div
      id={READING_OPTIONS_ID}
      hidden={!open}
      role="region"
      aria-labelledby={`${READING_OPTIONS_ID}-heading`}
      // Capped to the room under the nav row so a tall phone layout still reaches Done.
      className="max-h-[calc(100dvh-60px)] overflow-y-auto border-t border-line bg-paper xl:max-h-[calc(100dvh-72px)]"
    >
      <div className={`${headerColumnClass} py-5`}>
        <p
          id={`${READING_OPTIONS_ID}-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-h3 text-ink outline-none"
        >
          Reading options
        </p>
        <p className="mt-1 text-body text-ink-2">
          Pick what makes this site easier to read. Your choices are saved on this device only.
        </p>
        <ReadingOptionGroups
          className="mt-5"
          actions={({ changed, reset }) => (
            <div className="flex flex-wrap gap-3 lg:flex-col lg:pt-7">
              <Button variant="secondary" size="sm" onClick={reset} disabled={!changed}>
                Back to normal
              </Button>
              <Button size="sm" onClick={done}>
                Done
              </Button>
            </div>
          )}
        />
        <p className="mt-5 text-small text-ink-3">
          <Link href="/accessibility/" className="underline underline-offset-3 hover:text-ink">
            More about accessibility on this site
          </Link>
        </p>
      </div>
    </div>
  );
}
