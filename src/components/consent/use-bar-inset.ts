'use client';

import { type RefObject, useEffect } from 'react';

/**
 * While the bar is open, publishes its height (`--consent-bar-h`, the room the
 * body keeps free at the bottom so the footer's last line can scroll above it)
 * and how much of the viewport it covers with anything under it
 * (`--consent-cover`, the scroll padding that keeps a focused control in view,
 * WCAG 2.4.11). Both are cleared when it closes (globals.css, "Privacy choices").
 */
export function useBarInset(ref: RefObject<HTMLElement | null>, open: boolean): void {
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
      root.setProperty('--consent-cover', `${Math.ceil(cover)}px`);
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
  }, [ref, open]);
}
