/**
 * Max Discher – TEAM-DOSSIER.md §3 and his LinkedIn profile, re-read signed in
 * on 2026-09-04. State Bar #321720, Active [CalBar]. "Associate Attorney" is
 * Arthur's call (2026-09-01). Homebase, the internships, the Morehouse degree,
 * the Redwood City seats, Maker Nexus, the CERT training, the BART award, and
 * the conference work come from LinkedIn (self-reported). The bio is about who
 * he is and his credentials, not the work he does inside the firm (Arthur,
 * 2026-09-04). His "contract attorney" LinkedIn line is left out: it would
 * contradict the title Arthur chose. No graduation or bar-admission years.
 */

import { headshot, type TeamMember } from './member';

export const maxDischer: TeamMember = {
  slug: 'max-discher',
  name: 'Max Discher',
  title: 'Associate Attorney',
  barStatus: 'Licensed in California, State Bar #321720',
  barNumber: '321720',
  focus: 'Trust, estate, and elder financial abuse litigation',
  summary:
    'Max Discher is an associate attorney at Rothrock Legal in San Jose. A Santa Clara ' +
    'University School of Law graduate, he spent seven years as a staff attorney at Homebase, ' +
    'a Bay Area nonprofit working to end homelessness.',
  bio: [
    "Max Discher is an associate attorney at Rothrock Legal, working on the firm's trust, " +
      'estate, and elder financial abuse cases. He came to litigation from public interest law, ' +
      'and he is a graduate of Santa Clara University School of Law, where he and Arthur were ' +
      'classmates.',
    'For seven years he was a staff attorney, and later senior staff attorney, at Homebase, a ' +
      'San Francisco nonprofit that helps communities end homelessness. He advised San Francisco, ' +
      'Napa, and Clark County, Nevada on federal housing funding rules and homelessness policy, ' +
      'and presented that work at national conferences. Before that he interned in criminal ' +
      'defense in Redwood City, with asylum seekers in Melbourne, and at a law firm in Budapest.',
    'Max earned his B.A. in French Language and Literature at Morehouse College and his J.D. at ' +
      'Santa Clara University School of Law, with a certificate in public international law. He ' +
      'is a member of the State Bar of California, and his State Bar profile lists elder law, ' +
      'trusts and estates, and wills and probate as his practice areas. He speaks French.',
    'Max grew up in Redwood City and still lives there. The City Council appointed him a ' +
      'commissioner on its Housing and Human Concerns Committee after two years on the Police ' +
      'Advisory Committee. He sits on the executive board of Maker Nexus, a nonprofit makerspace ' +
      "in Sunnyvale, trains with his community's emergency response team, and in 2019 the BART " +
      'Police gave him their Good Samaritan Award for an act of bravery. He has said he prides ' +
      'himself on “a relentless pursuit of compromise,” which turns out to be a useful habit in ' +
      'a family fight over a trust.',
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
      notes: ['Certificate in Public International Law'],
    },
    { school: 'Morehouse College', degree: 'B.A., French Language and Literature' },
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
  updatedAt: '2026-09-04',
};
