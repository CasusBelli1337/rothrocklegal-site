export interface RedirectTarget {
  /** New app-router path (with trailing slash; may carry a query string). */
  to: string;
  /** Human label for the visible fallback link. */
  label: string;
}

const LIBRARY = { to: '/library/', label: 'The Library' };

/** The 9 legacy posts: new slug and old Wix slug both redirect to the library article (IA.md §4b–4c). */
const posts: { slug: string; oldSlug: string; label: string }[] = [
  {
    slug: 'ai-and-the-law-navigating-the-minefield',
    oldSlug: 'tech-meets-law-stay-updated-with-our-insights',
    label: 'AI and the Law: Navigating the Minefield of Emerging Legal Issues',
  },
  {
    slug: 'antitrust-concerns-with-ai-pricing',
    oldSlug: 'client-alerts',
    label: 'Antitrust Concerns with AI Pricing',
  },
  {
    slug: 'data-privacy-compliance-challenges',
    oldSlug: 'get-jacked-with-ai',
    label: 'Data Privacy Compliance Challenges',
  },
  {
    slug: 'employment-law-risks-and-considerations',
    oldSlug: 'client-alerts-2',
    label: 'Employment Law Risks and Considerations',
  },
  {
    slug: 'intellectual-property-considerations',
    oldSlug: 'how-to-train-you-ai-to-be-a-man',
    label: 'Intellectual Property Considerations',
  },
  {
    slug: 'revolutionizing-legal-access-the-journey-of-the-caselaw-access-project',
    oldSlug: 'press-releases',
    label: 'Revolutionizing Legal Access: The Journey of the Caselaw Access Project',
  },
  {
    slug: 'the-ai-revolution-a-call-to-action-for-lawyers',
    oldSlug: 'client-alerts-1',
    label: 'The AI Revolution: A Call to Action for Lawyers',
  },
  {
    slug: 'the-legal-landscape-of-ai-commercial-transactions',
    oldSlug: 'ai-and-the-law-navigating-the-minefield-of-emerging-legal-issues',
    label: 'The Legal Landscape of AI Commercial Transactions',
  },
  {
    slug: 'what-is-ai',
    oldSlug: 'insights-into-legal-innovation-and-technology',
    label: 'What is AI?',
  },
];

function postRedirects(): Record<string, RedirectTarget> {
  const map: Record<string, RedirectTarget> = {};
  for (const post of posts) {
    const target = { to: `/library/${post.slug}/`, label: post.label };
    map[`post/${post.slug}`] = target;
    map[`post/${post.oldSlug}`] = target;
  }
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
  'projects-6': {
    to: '/library/intellectual-property-considerations/',
    label: 'Intellectual Property Considerations',
  },
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
  'ip-considerations': {
    to: '/library/intellectual-property-considerations/',
    label: 'Intellectual Property Considerations',
  },
  'ai-glossary': { to: '/library/ai-glossary/', label: 'AI Terminology' },
  ...postRedirects(),
};

/** Relative URL from an exported stub directory up to the site root, then down to `to`. */
export function relativeTarget(fromPath: string, to: string): string {
  const depth = fromPath.split('/').length;
  return '../'.repeat(depth) + to.replace(/^\//, '');
}
