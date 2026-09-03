export interface RedirectTarget {
  /** New app-router path (with trailing slash; may carry a query string). */
  to: string;
  /** Human label for the visible fallback link. */
  label: string;
}

const LIBRARY = { to: '/library/', label: 'The Library' };

/**
 * The nine pre-redesign Technology & the Law posts were retired on 2026-09-03
 * (placeholders with stock images). Each pair is [redesign slug, old Wix slug];
 * both /post/<slug>/ URLs land on the library index (IA.md §4b–4c).
 */
const retiredPosts: readonly (readonly [string, string])[] = [
  ['ai-and-the-law-navigating-the-minefield', 'tech-meets-law-stay-updated-with-our-insights'],
  ['antitrust-concerns-with-ai-pricing', 'client-alerts'],
  ['data-privacy-compliance-challenges', 'get-jacked-with-ai'],
  ['employment-law-risks-and-considerations', 'client-alerts-2'],
  ['intellectual-property-considerations', 'how-to-train-you-ai-to-be-a-man'],
  ['revolutionizing-legal-access-the-journey-of-the-caselaw-access-project', 'press-releases'],
  ['the-ai-revolution-a-call-to-action-for-lawyers', 'client-alerts-1'],
  [
    'the-legal-landscape-of-ai-commercial-transactions',
    'ai-and-the-law-navigating-the-minefield-of-emerging-legal-issues',
  ],
  ['what-is-ai', 'insights-into-legal-innovation-and-technology'],
];

function postRedirects(): Record<string, RedirectTarget> {
  const map: Record<string, RedirectTarget> = {};
  for (const pair of retiredPosts) for (const slug of pair) map[`post/${slug}`] = LIBRARY;
  if (Object.keys(map).length !== 18)
    throw new Error(`Expected 18 post redirects, built ${Object.keys(map).length}`);
  return map;
}

/**
 * Every retired URL → its new home (IA.md §4). Each key becomes a static
 * meta-refresh stub via src/app/[...legacy]/ so live links never 404.
 */
export const legacyRedirects: Record<string, RedirectTarget> = {
  // 4d: old Wix paths
  home: { to: '/', label: 'Home' },
  'about-1': { to: '/about/', label: 'About' },
  'about-8': { to: '/faq/', label: 'Frequently Asked Questions' },
  'contact-7': { to: '/contact/', label: 'Contact' },
  'projects-6': LIBRARY,
  'general-5': { to: '/library/ai-glossary/', label: 'AI Terminology' },
  blog: LIBRARY,
  'blog/categories/recent-events': LIBRARY,
  'blog/categories/latest-news': LIBRARY,
  'blog/categories/media-coverage': LIBRARY,
  'blog/categories/press-releases': LIBRARY,
  'blog/categories/client-alerts': LIBRARY,
  // 4b: app-router pages that moved
  'news-and-events': LIBRARY,
  'for-lawyers-by-lawyers': {
    to: '/library/?category=technology-and-the-law',
    label: 'Technology & the Law',
  },
  'ip-considerations': LIBRARY,
  'ai-glossary': { to: '/library/ai-glossary/', label: 'AI Terminology' },
  ...postRedirects(),
};

/** Relative URL from an exported stub directory up to the site root, then down to `to`. */
export function relativeTarget(fromPath: string, to: string): string {
  const depth = fromPath.split('/').length;
  return '../'.repeat(depth) + to.replace(/^\//, '');
}
