/**
 * Max Discher – TEAM-DOSSIER.md §3 (2026-09-01). State Bar #321720, Active,
 * admitted 2018-08-25 [CalBar]. "Associate Attorney" is how Arthur described
 * him to a client but the label is Arthur's call, so it carries [CONFIRM]
 * (noindex + draft chip until cleared). Homebase start year and the contract
 * practice line are flagged in the dossier and left out.
 */

import { headshot, type TeamMember } from './member';

export const maxDischer: TeamMember = {
  slug: 'max-discher',
  name: 'Max Discher',
  title: 'Associate Attorney [CONFIRM]',
  barStatus: 'Licensed in California, State Bar #321720 (2018)',
  barNumber: '321720',
  focus: 'Record review and cite-checking in trust, estate, and elder abuse cases',
  summary:
    "Max Discher works on the firm's trust, estate, and elder financial abuse cases, checking " +
    'every citation and every fact before a brief is filed. Formerly a staff attorney at ' +
    'Homebase, a Bay Area nonprofit working to end homelessness.',
  bio: [
    "Max Discher works on Rothrock Legal's trust, estate, and elder abuse cases. His job is the " +
      'part of litigation clients never see and judges always notice: he reads the record, ' +
      'verifies every citation in a brief, and checks that each argument matches what the ' +
      'documents actually say. In a trust contest, one wrong date or one overstated fact can ' +
      'cost a family its credibility with the court. Max is the reason that does not happen.',
    'He came to litigation from public interest law. For several years, until 2025, he was a ' +
      'staff attorney, and later senior staff attorney, at Homebase, a Bay Area nonprofit that ' +
      'helps communities end homelessness. He advised San Francisco, Napa, and Clark County, ' +
      'Nevada on federal housing funding rules and local homelessness policy. Before that he ' +
      'worked with asylum seekers in Australia, with marginalized communities in the Dominican ' +
      'Republic, and with indigent criminal defendants in California.',
    'Max earned his B.A. at Morehouse College and his J.D. at Santa Clara University School of ' +
      'Law (2016), with a certificate in public international law. He was admitted to the State ' +
      'Bar of California in August 2018. His State Bar profile lists elder law, trusts and ' +
      'estates, and wills and probate as his practice areas. He speaks French.',
    "Max grew up in Redwood City and still lives there. He served two years on the city's " +
      'Police Advisory Committee, and in 2025 the City Council appointed him to the Housing and ' +
      'Human Concerns Committee, where his term runs through 2030. He has said he prides ' +
      'himself on “a relentless pursuit of compromise,” which turns out to be a useful habit in ' +
      'a family fight over a trust.',
  ],
  image: headshot('max-discher', 'Max Discher, attorney at Rothrock Legal'),
  credentials: [],
  leadership: [
    {
      role: 'Member',
      organization: 'Redwood City Housing and Human Concerns Committee',
      years: '2025–present',
    },
  ],
  education: [
    {
      school: 'Santa Clara University School of Law',
      degree: 'J.D.',
      year: '2016',
      notes: ['Certificate in Public International Law'],
    },
    { school: 'Morehouse College', degree: 'B.A.' },
  ],
  memberships: [],
  appearances: [],
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/321720',
    'https://www.linkedin.com/in/max-discher-17182a60/',
  ],
  practices: [
    'financial-elder-abuse',
    'undue-influence-and-capacity',
    'trust-contests',
    'will-contests',
  ],
  updatedAt: '2026-09-01',
};
