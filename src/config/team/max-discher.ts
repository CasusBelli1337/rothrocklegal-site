/**
 * Max Discher – TEAM-DOSSIER.md §3 (2026-09-01). State Bar #321720, Active,
 * admitted 2018-08-25 [CalBar]. "Associate Attorney" is Arthur's call
 * (2026-09-01). Homebase years, the Morehouse degree, the commissioner seat,
 * and Maker Nexus come from the dossier's LinkedIn Addendum (self-reported).
 * His "contract attorney" LinkedIn line is left out: it would contradict the
 * title Arthur chose. The Dominican Republic work is not on LinkedIn and is
 * no longer relied on.
 */

import { headshot, type TeamMember } from './member';

export const maxDischer: TeamMember = {
  slug: 'max-discher',
  name: 'Max Discher',
  title: 'Associate Attorney',
  barStatus: 'Licensed in California, State Bar #321720',
  barNumber: '321720',
  focus: 'Record review and cite-checking in trust, estate, and elder abuse cases',
  // Bio paragraph 2: Homebase 2018 to 2025, advising San Francisco, Napa, and Clark County.
  proofLine: 'Seven years advising cities on housing before joining the firm',
  summary:
    "Max Discher works on the firm's trust, estate, and elder financial abuse cases, checking " +
    'every citation and every fact before a brief is filed. Formerly a senior staff attorney at ' +
    'Homebase, a Bay Area nonprofit working to end homelessness.',
  bio: [
    "Max Discher works on Rothrock Legal's trust, estate, and elder abuse cases. His job is the " +
      'part of litigation clients never see and judges always notice: he reads the record, ' +
      'verifies every citation in a brief, and checks that each argument matches what the ' +
      'documents actually say. In a trust contest, one wrong date or one overstated fact can ' +
      'cost a family its credibility with the court. Max is the reason that does not happen.',
    'He came to litigation from public interest law. From 2018 to 2025 he was a staff ' +
      'attorney, and later senior staff attorney, at Homebase, a Bay Area nonprofit that helps ' +
      'communities end homelessness. He advised San Francisco, Napa, and Clark County, Nevada ' +
      'on federal housing funding rules and local homelessness policy. Before that he worked ' +
      'with asylum seekers in Australia and with indigent criminal defendants in California.',
    'Max earned his B.A. in French Language and Literature at Morehouse College (2008) and his ' +
      'J.D. at Santa Clara University School of Law (2016), with a certificate in public ' +
      'international law. He was admitted to the State Bar of California in August 2018. His ' +
      'State Bar profile lists elder law, trusts and estates, and wills and probate as his ' +
      'practice areas. He speaks French.',
    "Max grew up in Redwood City and still lives there. He served two years on the city's " +
      'Police Advisory Committee, and in 2025 the City Council appointed him a commissioner on ' +
      'the Housing and Human Concerns Committee, where his term runs through 2030. He also sits ' +
      'on the executive board of Maker Nexus, a nonprofit makerspace in Sunnyvale. He has said ' +
      'he prides himself on “a relentless pursuit of compromise,” which turns out to be a useful ' +
      'habit in a family fight over a trust.',
  ],
  image: headshot('max-discher', 'Max Discher, Associate Attorney at Rothrock Legal'),
  credentials: [],
  leadership: [
    {
      role: 'Commissioner',
      organization: 'Redwood City Housing and Human Concerns Committee',
      years: '2025–present',
    },
    {
      role: 'Executive Board Member',
      organization: 'Maker Nexus',
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
    { school: 'Morehouse College', degree: 'B.A., French Language and Literature', year: '2008' },
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
