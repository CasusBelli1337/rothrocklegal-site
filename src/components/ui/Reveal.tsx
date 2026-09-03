'use client';

import { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger the direct children 60ms apart (max 6) instead of revealing the wrapper. */
  stagger?: boolean;
  id?: string;
}

/**
 * Reveals once when scrolled into view: opacity 0→1 + 12px rise, 400ms.
 * Motion lives in globals.css. Content renders visible and is hidden (armed)
 * only after hydration, and only if it is still below the viewport, so a slow
 * phone never scrolls into blank sections and the reveal never delays LCP.
 * Reduced-motion users (the OS setting or the site's reading option) and
 * no-JS readers see everything immediately (DESIGN-BRIEF §8).
 */
export function Reveal({ children, className, stagger, id }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced';
    const inView = el.getBoundingClientRect().top < window.innerHeight;
    if (reduceMotion || inView || !('IntersectionObserver' in window)) return;
    el.classList.add('is-armed');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      data-reveal={stagger ? undefined : ''}
      data-reveal-stagger={stagger ? '' : undefined}
    >
      {children}
    </div>
  );
}
