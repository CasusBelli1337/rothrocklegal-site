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
    name: 'Santa Clara County Superior Court – Probate Division',
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
    name: 'Fremont',
    slug: 'fremont',
    county: 'Alameda County',
    note: 'Fremont sits in Alameda County, so a Fremont trust dispute is usually filed in Alameda County Superior Court. We appear there regularly.',
  },
] as const;

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
