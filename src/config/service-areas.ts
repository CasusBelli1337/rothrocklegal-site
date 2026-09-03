/**
 * Where the firm practices (CONTRACTS.md §4). Feeds the footer, the
 * /service-areas/ page, and the LegalService `areaServed` JSON-LD.
 */

export interface Court {
  name: string;
  /** Shown on the page and in the footer. Only the probate courthouse has a street address. */
  address?: string;
  city: string;
}

export interface City {
  name: string;
  /** Anchor id on /service-areas/. */
  slug: string;
  county: 'Santa Clara County' | 'San Mateo County' | 'Alameda County';
  /** One or two plain sentences of real local context (no doorway copy). */
  note: string;
}

export const courts: readonly Court[] = [
  {
    name: 'Santa Clara County Superior Court',
    address: '191 N. First Street, San Jose',
    city: 'San Jose',
  },
  { name: 'San Mateo County Superior Court', city: 'Redwood City' },
  { name: 'Alameda County Superior Court', city: 'Oakland' },
  { name: 'San Francisco Superior Court', city: 'San Francisco' },
] as const;

export const counties = [
  'Santa Clara County',
  'San Mateo County',
  'Alameda County',
  'San Francisco County',
] as const;

export const regions = [
  'Silicon Valley',
  'the Peninsula',
  'the East Bay',
  'San Francisco Bay Area',
] as const;

export const cities: readonly City[] = [
  {
    name: 'San Jose',
    slug: 'san-jose',
    county: 'Santa Clara County',
    note: 'Our home court. Trust and estate cases for San Jose families are heard in the Probate Division at 191 N. First Street. We appear there in person; everything else, we do by video.',
  },
  {
    name: 'Palo Alto',
    slug: 'palo-alto',
    county: 'Santa Clara County',
    note: 'Palo Alto estates often hold company stock and real property that has appreciated for decades. Those cases are filed in San Jose, not locally.',
  },
  {
    name: 'Los Altos',
    slug: 'los-altos',
    county: 'Santa Clara County',
    note: 'Los Altos estates often hold a home bought decades ago and a brokerage account with its own beneficiary form. Those disputes are filed in the San Jose Probate Division.',
  },
  {
    name: 'Los Altos Hills',
    slug: 'los-altos-hills',
    county: 'Santa Clara County',
    note: 'Los Altos Hills trusts tend to hold one very valuable property and, often, an LLC or a family business. Complex estate cases from Los Altos Hills are heard in San Jose.',
  },
  {
    name: 'Sunnyvale',
    slug: 'sunnyvale',
    county: 'Santa Clara County',
    note: 'Sunnyvale trust disputes go to the San Jose probate courthouse. We meet Sunnyvale clients by video, so there is no drive to make.',
  },
  {
    name: 'Mountain View',
    slug: 'mountain-view',
    county: 'Santa Clara County',
    note: 'Mountain View families with a trust dispute file in Santa Clara County Superior Court in San Jose.',
  },
  {
    name: 'Cupertino',
    slug: 'cupertino',
    county: 'Santa Clara County',
    note: 'Cupertino cases are heard in San Jose. Many involve a family home held in trust for decades.',
  },
  {
    name: 'Los Gatos',
    slug: 'los-gatos',
    county: 'Santa Clara County',
    note: 'Los Gatos and Monte Sereno trust and will contests are filed in the San Jose Probate Division.',
  },
  {
    name: 'Saratoga',
    slug: 'saratoga',
    county: 'Santa Clara County',
    note: 'Saratoga estates frequently involve blended families and late amendments. Cases go to San Jose.',
  },
  {
    name: 'Campbell',
    slug: 'campbell',
    county: 'Santa Clara County',
    note: 'Campbell is minutes from the San Jose courthouse, which matters on hearing day. The rest of the case happens by video.',
  },
  {
    name: 'Milpitas',
    slug: 'milpitas',
    county: 'Santa Clara County',
    note: 'Milpitas trust and elder abuse matters are filed in Santa Clara County Superior Court in San Jose.',
  },
  {
    name: 'Atherton',
    slug: 'atherton',
    county: 'San Mateo County',
    note: 'Atherton is in San Mateo County, so an Atherton trust or estate dispute is filed in San Mateo County Superior Court in Redwood City. Many involve several properties and a blended family.',
  },
  {
    name: 'Menlo Park',
    slug: 'menlo-park',
    county: 'San Mateo County',
    note: 'Menlo Park cases go to San Mateo County Superior Court in Redwood City. We appear there regularly and meet Menlo Park clients by video.',
  },
  {
    name: 'Woodside',
    slug: 'woodside',
    county: 'San Mateo County',
    note: 'Woodside estates often hold acreage, an LLC, or a family business alongside the house. Those cases are filed in Redwood City, not San Jose.',
  },
  {
    name: 'Portola Valley',
    slug: 'portola-valley',
    county: 'San Mateo County',
    note: 'Portola Valley sits in San Mateo County. Trust and estate disputes are heard in the Superior Court in Redwood City.',
  },
  {
    name: 'Hillsborough',
    slug: 'hillsborough',
    county: 'San Mateo County',
    note: 'Hillsborough estates are among the largest on the Peninsula, and the disputes tend to match. Cases are filed in San Mateo County Superior Court in Redwood City.',
  },
  {
    name: 'Burlingame',
    slug: 'burlingame',
    county: 'San Mateo County',
    note: 'Burlingame trust and will contests go to San Mateo County Superior Court in Redwood City, a short drive down the 101. Everything before the hearing happens by video.',
  },
  {
    name: 'Fremont',
    slug: 'fremont',
    county: 'Alameda County',
    note: 'Fremont sits in Alameda County, so a Fremont trust dispute is usually filed in Alameda County Superior Court. We appear there regularly.',
  },
] as const;

/** City names in one county, in config order. */
export function citiesIn(county: City['county']): string[] {
  return cities.filter((c) => c.county === county).map((c) => c.name);
}

/** 'Fremont'; 'Atherton and Menlo Park'; 'Atherton, Menlo Park, and Woodside'. */
export function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** Areas for the LegalService `areaServed` list (SEO-SPEC §3a). */
export function areaServed(): {
  '@type': 'City' | 'AdministrativeArea';
  name: string;
}[] {
  return [
    ...cities.map((c) => ({ '@type': 'City' as const, name: c.name })),
    ...counties.map((name) => ({
      '@type': 'AdministrativeArea' as const,
      name,
    })),
  ];
}
