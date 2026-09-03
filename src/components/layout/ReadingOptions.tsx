'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
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

/** The control: text label plus icon, 44px tall, toggles the bar below it. */
function ReadingOptionsButton({ open, onToggle }: ButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={READING_OPTIONS_ID}
      onClick={onToggle}
      data-reading-options-button
      className={`inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-ui font-medium text-ink-2 transition-colors duration-150 hover:bg-paper hover:text-ink ${open ? 'bg-paper text-ink' : ''}`}
    >
      <TextSizeIcon />
      Reading options
    </button>
  );
}

interface BarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The inline bar under the strip. It is in the document flow, so it pushes
 * the page down and never covers anything. Escape closes it and puts focus
 * back on the button that opened it.
 */
function ReadingOptionsBar({ open, onClose }: BarProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const close = () => {
      onClose();
      document.querySelector<HTMLElement>('[data-reading-options-button]')?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      id={READING_OPTIONS_ID}
      hidden={!open}
      role="region"
      aria-labelledby={`${READING_OPTIONS_ID}-heading`}
      className="border-t border-line bg-paper"
    >
      <Container className="py-5">
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
              <Button size="sm" onClick={onClose}>
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
      </Container>
    </div>
  );
}

/**
 * The slim strip above the header on every page: the one control, right-aligned,
 * and the bar it opens. Not sticky on purpose: a reader sets this once, and
 * the sticky nav row keeps its room for the logo, the menu, and the consult button.
 */
export function ReadingOptionsStrip() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="border-b border-line bg-sand">
      <Container className="flex h-11 items-center justify-end">
        <ReadingOptionsButton open={open} onToggle={() => setOpen((value) => !value)} />
      </Container>
      <ReadingOptionsBar open={open} onClose={close} />
    </div>
  );
}
