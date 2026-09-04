/**
 * Gerry Lin – TEAM-DOSSIER.md §1 and his LinkedIn profile, re-read signed in
 * on 2026-09-04. State Bar #366572, Active [CalBar]. "Associate Attorney" is
 * Arthur's call (2026-09-01). Santa Clara Law in Arthur's class, UT Austin
 * before it, and the firms come from LinkedIn (self-reported). The bio is
 * about who he is and his credentials, not the work he does inside the firm
 * (Arthur, 2026-09-04); the "provisionally licensed" label from the Koster
 * years stays out ("worked at"), as does the remote-from-Texas line. No
 * graduation or bar-admission years anywhere.
 */

import { headshot, type TeamMember } from './member';

export const gerryLin: TeamMember = {
  slug: 'gerry-lin',
  name: 'Gerry Lin',
  title: 'Associate Attorney',
  barStatus: 'Licensed in California, State Bar #366572',
  barNumber: '366572',
  focus: 'Trust and estate litigation',
  summary:
    'Gerry Lin is an associate attorney at Rothrock Legal in San Jose, a graduate of Santa ' +
    'Clara University School of Law, and a member of the State Bar of California.',
  bio: [
    "Gerry Lin is an associate attorney at Rothrock Legal, working on the firm's trust and " +
      'estate cases. He is a graduate of Santa Clara University School of Law, where he and ' +
      'Arthur were classmates, and a member of the State Bar of California.',
    'Before joining the firm he worked at two law offices, Koster & Leadbetter, LLP and the Law ' +
      'Office of A. Thomas Koster, and clerked at two law firms, Tsao-Wu & Yee LLP and Loung Law ' +
      'Firm PLLC, after a legal internship at Tsao-Wu, Chow & Yee LLP during law school.',
    'He came to law school from the University of Texas at Austin.',
  ],
  image: headshot('gerry-lin', 'Gerry Lin, Associate Attorney at Rothrock Legal'),
  credentials: [],
  leadership: [],
  education: [
    { school: 'Santa Clara University School of Law', degree: 'J.D.' },
    { school: 'The University of Texas at Austin', degree: 'Undergraduate studies' },
  ],
  memberships: [],
  appearances: [],
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/366572',
    'https://www.linkedin.com/in/gerry-lin-34862894/',
  ],
  practices: ['trust-accounting-disputes', 'breach-of-fiduciary-duty', 'trust-contests'],
  updatedAt: '2026-09-04',
};
