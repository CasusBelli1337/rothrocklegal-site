'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { lensConfig } from '@/config/lens';
import { signalForPath } from './signals';
import { claimSessionFlag, recordEffect } from './store';
import { LENS_EVENT_ATTR } from './types';
import { useLens } from './useLens';

let landedThisLoad = false;

/** The first path of a tab session is the landing; everything after is navigation. */
function claimLanding(): boolean {
  if (landedThisLoad) return false;
  landedThisLoad = true;
  return claimSessionFlag(lensConfig.landingKey);
}

interface LensTrackerProps {
  /** slug → landing weight for the articles that carry one (built at export time). */
  articleWeights: Readonly<Record<string, number>>;
}

/**
 * Mounted once in the root layout. Records the landing and navigation signals,
 * mirrors the resolved lens onto html[data-lens], and relays clicks on
 * [data-lens-event] links. Renders nothing.
 */
export function LensTracker({ articleWeights }: LensTrackerProps) {
  const pathname = usePathname();
  const { lens, record } = useLens();

  useEffect(() => {
    const effect = signalForPath(pathname, claimLanding(), articleWeights);
    if (effect) recordEffect(effect);
  }, [pathname, articleWeights]);

  useEffect(() => {
    document.documentElement.dataset.lens = lens;
  }, [lens]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const key = target?.closest(`[${LENS_EVENT_ATTR}]`)?.getAttribute(LENS_EVENT_ATTR);
      if (key) record(key);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [record]);

  return null;
}
