import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { MAX_URLS, buildPayload, changedUrls, parseSitemap, readSiteConfig } from './indexnow.mjs';

const HOST = 'https://www.rothrocklegal.com';
const sitemap = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(
      ([loc, lastmod]) =>
        `<url>\n<loc>${loc}</loc>\n${lastmod ? `<lastmod>${lastmod}</lastmod>\n` : ''}</url>`,
    )
    .join('\n')}\n</urlset>`;

describe('parseSitemap', () => {
  it('reads loc and lastmod in order, lastmod empty when absent', () => {
    const xml = sitemap([
      [`${HOST}/`, '2026-09-03T07:00:00.000Z'],
      [`${HOST}/library/`, ''],
    ]);
    expect(parseSitemap(xml)).toEqual([
      { loc: `${HOST}/`, lastmod: '2026-09-03T07:00:00.000Z' },
      { loc: `${HOST}/library/`, lastmod: '' },
    ]);
    expect(parseSitemap('<urlset></urlset>')).toEqual([]);
  });
});

describe('changedUrls (the URL list builder)', () => {
  const previous = [
    { loc: `${HOST}/`, lastmod: '2026-09-03' },
    { loc: `${HOST}/attorneys/arthur-rothrock/`, lastmod: '2026-09-04' },
    { loc: `${HOST}/old-page/`, lastmod: '2026-01-01' },
  ];

  it('submits new and re-dated URLs, then the ones that left the sitemap', () => {
    const current = [
      { loc: `${HOST}/`, lastmod: '2026-09-03' },
      { loc: `${HOST}/attorneys/arthur-rothrock/`, lastmod: '2026-10-01' },
      { loc: `${HOST}/library/new-article/`, lastmod: '2026-10-01' },
    ];
    expect(changedUrls(current, previous)).toEqual([
      `${HOST}/attorneys/arthur-rothrock/`,
      `${HOST}/library/new-article/`,
      `${HOST}/old-page/`,
    ]);
  });

  it('submits nothing when nothing changed', () => {
    expect(changedUrls(previous, previous)).toEqual([]);
  });

  it('submits everything against an empty previous sitemap', () => {
    expect(changedUrls(previous, [])).toEqual(previous.map((entry) => entry.loc));
  });
});

describe('buildPayload', () => {
  const key = 'c92dd84a8ed7cf41116d8a40bda52aa4';

  it('builds host, key, keyLocation, and a deduplicated urlList', () => {
    const urls = [`${HOST}/`, `${HOST}/library/`, `${HOST}/`];
    expect(buildPayload({ canonicalHost: HOST, key, urls })).toEqual({
      host: 'www.rothrocklegal.com',
      key,
      keyLocation: `${HOST}/${key}.txt`,
      urlList: [`${HOST}/`, `${HOST}/library/`],
    });
  });

  it('refuses URLs on another host and lists over the IndexNow cap', () => {
    expect(() =>
      buildPayload({ canonicalHost: HOST, key, urls: ['https://rothrocklegal.com/'] }),
    ).toThrow(/not on www\.rothrocklegal\.com/);
    const many = Array.from({ length: MAX_URLS + 1 }, (_, i) => `${HOST}/p${i}/`);
    expect(() => buildPayload({ canonicalHost: HOST, key, urls: many })).toThrow(/max 10000/);
  });
});

describe('the key', () => {
  it('reads the same host and key from site.ts as the site uses', () => {
    const config = readSiteConfig(fs.readFileSync('src/config/site.ts', 'utf8'));
    expect(config).toEqual({ canonicalHost: site.canonicalHost, key: site.indexNowKey });
  });

  it('is 32 hex characters served at /<key>.txt with exactly the key inside', () => {
    expect(site.indexNowKey).toMatch(/^[0-9a-f]{32}$/);
    expect(fs.readFileSync(`public/${site.indexNowKey}.txt`, 'utf8').trim()).toBe(site.indexNowKey);
  });
});
