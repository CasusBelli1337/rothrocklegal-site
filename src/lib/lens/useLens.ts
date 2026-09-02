'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { signalForEvent } from './signals';
import { currentLens, recordEffect, subscribeLens } from './store';
import type { Lens } from './types';

const serverLens = (): Lens => 'neutral';

export interface LensBinding {
  lens: Lens;
  /** Records a click event ('card:for-trustees', 'switch:beneficiary', ...); keys the rules ignore are dropped. */
  record: (eventKey: string) => void;
}

/**
 * The resolved lens plus `record()`. Use `lens` only for behavior (a pre-checked
 * box, an order); copy switches through data-for + CSS so it is right before
 * hydration and needs no re-render.
 */
export function useLens(): LensBinding {
  const lens = useSyncExternalStore(subscribeLens, currentLens, serverLens);
  const record = useCallback((eventKey: string) => {
    const effect = signalForEvent(eventKey);
    if (effect) recordEffect(effect);
  }, []);
  return { lens, record };
}
