'use client';

import { type RefObject, useEffect } from 'react';

/**
 * While the bar is open, publishes its height (`--consent-bar-h`, the room the
 * body keeps free at the bottom so the footer's last line can scroll above it)
 * and how much of the viewport it covers with anything under it
 * (`--consent-cover`, the scroll padding that keeps a focused control in view,
 * WCAG 2.4.11, and the offset the consult flow's sticky action bar keeps,
 * intake.css). Both are cleared when it closes (globals.css, "Privacy choices").
 * `placement` is the bar's position class: a client-side page change can move
 * the bar (above the mobile consult bar or not) without resizing it.
 */
export function useBarInset(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  placement: string,
): void {
  useEffect(() => {
    const root = document.documentElement.style;
    const clear = () => {
      root.removeProperty('--consent-bar-h');
      root.removeProperty('--consent-cover');
    };
    const bar = ref.current;
    if (!open || !bar) return clear();
    const measure = () => {
      root.setProperty('--consent-bar-h', `${bar.offsetHeight}px`);
      const cover = Math.max(0, window.innerHeight - bar.getBoundingClientRect().top);
      // Down, not up: the action bar sticks at this offset, and a fraction rounded up
      // left a hairline of page showing between the two bars on a phone.
      root.setProperty('--consent-cover', `${Math.floor(cover)}px`);
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(bar);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      clear();
    };
  }, [ref, open, placement]);
}
