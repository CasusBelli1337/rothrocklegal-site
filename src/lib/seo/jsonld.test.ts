import { describe, expect, it } from 'vitest';
import { getPracticeArea, practiceAreas } from '@/config/practice-areas';
import { site } from '@/config/site';
import { getTeamMember, team } from '@/config/team';
import {
  ORG_ID,
  article,
  collectionPage,
  legalService,
  person,
  personId,
  practicePage,
  siteGraph,
  type JsonLdObject,
} from './jsonld';

const arthur = getTeamMember('arthur-rothrock');

describe('legalService', () => {
  const org = legalService();

  it('never carries a street address or a phone number (Arthur, 2026-09-03)', () => {
    expect(org.telephone).toBeUndefined();
    expect(JSON.stringify(org.address)).not.toMatch(/streetAddress|postalCode/);
  });

  it('lists only pages about the firm in sameAs, never a person profile', () => {
    for (const url of org.sameAs as string[]) expect(url).not.toMatch(/linkedin\.com\/in\//);
  });

  it('knows about every practice page and says how to reach the firm', () => {
    expect(org.knowsAbout).toEqual(practiceAreas.map((a) => a.topic));
    expect(org.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      email: site.email,
      url: 'https://www.rothrocklegal.com/request-a-consult/',
    });
  });
});

describe('person', () => {
  it('knows about the practice pages the bio links to', () => {
    for (const member of team) {
      expect(person(member).knowsAbout).toEqual(
        member.practices.map((slug) => getPracticeArea(slug).topic),
      );
    }
  });

  it('carries the bar credential only for a verified number', () => {
    for (const member of team) {
      expect(Boolean(person(member).hasCredential)).toBe(Boolean(member.barNumber));
    }
  });
});

describe('article', () => {
  const data = article({
    slug: 'how-to-contest-a-trust-in-california',
    title: 'How to Contest a Trust in California',
    description: 'd',
    image: '/images/library/how-to-contest-a-trust-in-california.webp',
    fallbackImage: site.ogImage,
    date: '2024-07-16',
    updated: '2025-04-15',
    author: arthur,
    category: 'Trust Contests',
    tags: ['trust contest'],
  });

  it('names a typed Person author with a profile URL (Google author guidelines)', () => {
    expect(data.author).toEqual({
      '@type': 'Person',
      '@id': personId('arthur-rothrock'),
      name: arthur.name,
      url: 'https://www.rothrocklegal.com/attorneys/arthur-rothrock/',
    });
  });

  it('leads with the article cover, not the site card', () => {
    expect(data.image).toEqual([
      'https://www.rothrocklegal.com/images/library/how-to-contest-a-trust-in-california.webp',
    ]);
    expect(data.articleSection).toBe('Trust Contests');
  });
});

describe('practicePage', () => {
  const area = getPracticeArea('trust-contests');
  const graph = practicePage(area, '/trust-contests/', arthur)['@graph'] as JsonLdObject[];

  it('pairs the page (with its byline) and the service the firm provides', () => {
    const [page, service] = graph;
    expect(page).toMatchObject({ '@type': 'WebPage', dateModified: area.updatedAt });
    expect((page.author as JsonLdObject)['@id']).toBe(personId('arthur-rothrock'));
    expect(service).toMatchObject({
      '@type': 'Service',
      serviceType: area.topic,
      provider: { '@id': ORG_ID },
    });
    expect(page.mainEntity).toEqual({ '@id': service['@id'] });
  });
});

describe('collectionPage', () => {
  it('lists its items in order', () => {
    const data = collectionPage({
      path: '/attorneys/',
      title: 't',
      description: 'd',
      items: team.map((m) => ({ path: `/attorneys/${m.slug}/`, name: m.name })),
    });
    const list = data.mainEntity as JsonLdObject;
    expect(list.numberOfItems).toBe(team.length);
    expect((list.itemListElement as JsonLdObject[])[0]).toMatchObject({ position: 1, name: team[0].name });
  });
});

describe('every builder', () => {
  it('writes no em dash and no unverified placeholder into markup', () => {
    const all = JSON.stringify([siteGraph(), ...team.map(person)]);
    expect(all).not.toContain('—');
    expect(all).not.toContain('[CONFIRM]');
  });
});
