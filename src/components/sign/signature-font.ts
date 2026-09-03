import { Great_Vibes } from 'next/font/google';

/**
 * The typed signature renders in a script face so it reads as a signature,
 * not italic text. Loaded only where the preview renders and never preloaded,
 * so the rest of the site pays nothing for it (docs/MOBILE.md on fonts).
 */
export const signatureFont = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['cursive'],
});
