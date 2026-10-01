import { describe, expect, it } from 'vitest';
import robots, { PRIVATE_PATHS } from '@/app/robots';
import { AI_CRAWLERS } from '@/config/crawlers';

describe('robots.txt', () => {
  const rules = [robots().rules].flat();

  it('names every AI crawler the site welcomes', () => {
    const named = rules.flatMap((r) => [r.userAgent ?? []].flat());
    for (const agent of [
      'GPTBot',
      'OAI-SearchBot',
      'ClaudeBot',
      'Claude-SearchBot',
      'PerplexityBot',
      'Google-Extended',
      'Applebot-Extended',
      'CCBot',
    ]) {
      expect(named).toContain(agent);
    }
    expect(new Set(AI_CRAWLERS).size).toBe(AI_CRAWLERS.length);
  });

  // A crawler with its own group ignores `*`, so every group must repeat the private paths.
  it('keeps the private paths closed in every group', () => {
    expect(PRIVATE_PATHS).toEqual(
      expect.arrayContaining(['/library/index.json', '/sign/', '/schedule/']),
    );
    for (const rule of rules) {
      expect([rule.disallow].flat()).toEqual(PRIVATE_PATHS);
      expect(rule.allow).toBe('/');
    }
  });

  it('points to the sitemap on the canonical host', () => {
    expect(robots().sitemap).toBe('https://www.rothrocklegal.com/sitemap.xml');
  });
});
