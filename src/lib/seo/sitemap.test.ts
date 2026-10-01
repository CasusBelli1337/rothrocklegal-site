import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { legal } from '@/components/legal/legal-constants';
import { getLibraryItems } from '@/lib/library/preview';

const day = (d: string | Date | undefined) => new Date(d ?? 0).toISOString().slice(0, 10);
const HOST = 'https://www.rothrocklegal.com';

describe('sitemap.xml', () => {
  const entries = sitemap();
  const at = (path: string) => entries.find((e) => e.url === `${HOST}${path}`);

  it('lists every published article and no draft', () => {
    for (const item of getLibraryItems()) {
      expect(Boolean(at(`/library/${item.slug}/`))).toBe(!item.draft);
    }
  });

  it('dates the legal pages by the date they print, not the site-wide date', () => {
    expect(day(at('/privacy-policy/')?.lastModified)).toBe(
      day(new Date(`${legal.privacyEffectiveDate}T00:00:00-07:00`)),
    );
    expect(day(at('/disclaimer/')?.lastModified)).toBe(
      day(new Date(`${legal.effectiveDate}T00:00:00-07:00`)),
    );
  });

  it('dates the library index no earlier than its newest article', () => {
    const newest = getLibraryItems()
      .filter((i) => !i.draft)
      .map((i) => i.updated)
      .sort()
      .at(-1);
    const library = at('/library/')?.lastModified;
    expect(new Date(library ?? 0).getTime()).toBeGreaterThanOrEqual(
      new Date(`${newest}T00:00:00-07:00`).getTime(),
    );
  });

  it('has one entry per URL', () => {
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });
});
