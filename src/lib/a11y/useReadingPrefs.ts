'use client';

import { useCallback, useEffect, useState } from 'react';
import type { A11yKey } from '@/config/a11y';
import {
  type A11yPrefs,
  commitA11yPrefs,
  readA11yPrefs,
  subscribeA11y,
  withA11yPref,
} from './store';

/**
 * Reading options for a control. The server renders defaults; after mount the
 * hook reads what the boot script stamped on <html>, then follows every change
 * from any other control on the page.
 */
export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<A11yPrefs>({});

  useEffect(() => {
    const sync = () => setPrefs(readA11yPrefs(document.documentElement.dataset));
    sync();
    return subscribeA11y(sync);
  }, []);

  const choose = useCallback(
    (key: A11yKey, value: string) => commitA11yPrefs(withA11yPref(prefs, key, value)),
    [prefs],
  );
  const reset = useCallback(() => commitA11yPrefs({}), []);

  return { prefs, choose, reset, changed: Object.keys(prefs).length > 0 };
}
