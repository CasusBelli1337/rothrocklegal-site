'use client';

import { useEffect, useState } from 'react';
import { UNKNOWN_BROWSER, currentBrowser, type BrowserInfo } from './browser';

/** The visitor's browser and device, known after hydration (unknown on the server and at first paint). */
export function useBrowser(): BrowserInfo {
  const [info, setInfo] = useState<BrowserInfo>(UNKNOWN_BROWSER);
  useEffect(() => setInfo(currentBrowser()), []);
  return info;
}
