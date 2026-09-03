import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

export const dynamic = 'force-static';

/** AI answer engines are explicitly allowed (SEO-SPEC §6). */
const AI_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/contact/thank-you/', '/library/index.json', ...PUBLIC_LINK_PATHS],
      },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${site.canonicalHost}/sitemap.xml`,
  };
}
