export interface RedirectTarget {
  /** New app-router path (with trailing slash). */
  to: string;
  /** Human label for the visible fallback link. */
  label: string;
}

/**
 * Old Wix URLs → new pages. Each entry becomes a static meta-refresh stub so
 * live links never 404. Old *post* slugs are handled separately via each
 * post's `oldSlug` frontmatter (see src/app/post/[slug]/page.tsx).
 */
export const legacyRedirects: Record<string, RedirectTarget> = {
  home: { to: '/', label: 'Home' },
  'about-1': { to: '/about/', label: 'About Us' },
  'about-8': { to: '/faq/', label: 'Frequently Asked Questions' },
  'contact-7': { to: '/contact/', label: 'Contact Us' },
  'projects-6': { to: '/ip-considerations/', label: 'Intellectual Property Considerations' },
  'general-5': { to: '/ai-glossary/', label: 'AI Terminology' },
  blog: { to: '/news-and-events/', label: 'News and Events' },
  'blog/categories/recent-events': { to: '/news-and-events/', label: 'News and Events' },
  'blog/categories/latest-news': { to: '/news-and-events/', label: 'News and Events' },
  'blog/categories/media-coverage': { to: '/news-and-events/', label: 'News and Events' },
  'blog/categories/press-releases': { to: '/news-and-events/', label: 'News and Events' },
  'blog/categories/client-alerts': { to: '/news-and-events/', label: 'News and Events' },
};

/** Relative URL from an exported stub directory up to the site root, then down to `to`. */
export function relativeTarget(fromPath: string, to: string): string {
  const depth = fromPath.split('/').length;
  return '../'.repeat(depth) + to.replace(/^\//, '');
}
