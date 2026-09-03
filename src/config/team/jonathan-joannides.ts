/**
 * Jonathan "JJ" Joannides – TEAM-DOSSIER.md §2 (2026-09-01). State Bar
 * #311260, Active, admitted 2016-12-01 [CalBar]. "Of Counsel" is Arthur's
 * call (2026-09-01), as is his role: depositions and hearings. Firm dates,
 * awards, MICS year, CIPP, and the HomeFirst years come from the dossier's
 * LinkedIn Addendum (self-reported). Still out: N.D. Cal. admission, Wine
 * Country Marines. "Practiced at" Wilson Sonsini and Fenwick, never "over a
 * decade" (about 5.5 years combined; RPC 7.1).
 */

import { headshot, type TeamMember } from './member';

export const jonathanJoannides: TeamMember = {
  slug: 'jonathan-joannides',
  name: 'Jonathan "JJ" Joannides',
  title: 'Of Counsel',
  barStatus: 'Licensed in California, State Bar #311260 (2016)',
  barNumber: '311260',
  focus: 'Depositions, hearings, and motion practice',
  // Bio paragraph 2: USMC infantry officer and captain; Wilson Sonsini 2016 to 2020; Fenwick & West 2022 to 2024.
  proofLine: 'Former Marine Corps infantry captain; Wilson Sonsini, Fenwick & West',
  summary:
    'Litigator and former U.S. Marine Corps infantry captain who takes the depositions and ' +
    "argues the hearings in Rothrock Legal's trust and estate cases. Founder of Digital " +
    'Frontier Law in San Jose and President of the Honorable William A. Ingram American Inn of ' +
    'Court.',
  bio: [
    'Jonathan Joannides, JJ to everyone who works with him, is the lawyer who takes the ' +
      "depositions and argues the hearings in the firm's trust and estate cases. Arthur sets " +
      'the strategy; JJ is the one across the table from the witness and at the lectern in ' +
      'Santa Clara County Superior Court. He also works on discovery disputes, oppositions, ' +
      'and replies, including sanctions motions and protective orders.',
    'Before law school he served nearly ten years in the U.S. Marine Corps as an infantry ' +
      'officer and captain. He led infantry platoons in combat in Iraq, ran counter-piracy ' +
      'operations off the coast of Somalia, and advised U.S. diplomatic posts in Bahrain and ' +
      'Pakistan on security. He went from that to Santa Clara University School of Law, then ' +
      'practiced at Wilson Sonsini in Palo Alto from 2016 to 2020, where the firm gave him its ' +
      'John Wilson Award for pro bono work in 2018 and its Pro Bono Award in 2019, then at ' +
      'Fenwick & West from 2022 to 2024 on privacy and cybersecurity, advising companies from ' +
      'startups to the Fortune 500. In 2025 he founded Digital Frontier Law, APC, a San Jose ' +
      'firm focused on AI, privacy, cybersecurity, and intellectual property, which he still ' +
      'runs.',
    'JJ holds a J.D. from Santa Clara University School of Law (2016), a Master of Information ' +
      'and Cybersecurity from UC Berkeley (2024), and a B.S. in Computer Science and ' +
      'Mathematics from the University of Minnesota (2003), and he is certified as a CIPP/E and ' +
      'CIPP/US privacy professional. He was admitted to the State Bar of California in December ' +
      '2016.',
    'He is President of the Honorable William A. Ingram American Inn of Court and served from ' +
      '2018 to 2024 on the board of HomeFirst, a provider of shelter and services for people ' +
      'without homes in Santa Clara County, including a term as its chairman. He and Arthur ' +
      'were classmates at Santa Clara Law.',
  ],
  image: headshot('jonathan-joannides', 'Jonathan "JJ" Joannides, Of Counsel at Rothrock Legal'),
  credentials: [],
  leadership: [
    {
      role: 'President',
      organization: 'Honorable William A. Ingram American Inn of Court',
    },
    {
      role: 'Board Director and former Chairman',
      organization: 'HomeFirst Services of Santa Clara County',
      years: '2018–2024',
    },
  ],
  education: [
    { school: 'Santa Clara University School of Law', degree: 'J.D.', year: '2016' },
    { school: 'UC Berkeley', degree: 'Master of Information and Cybersecurity', year: '2024' },
    {
      school: 'University of Minnesota',
      degree: 'B.S., Computer Science and Mathematics',
      year: '2003',
    },
  ],
  memberships: [],
  appearances: [],
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/311260',
    'https://www.linkedin.com/in/jonathanjoannides/',
    'https://www.digitalfrontierlaw.com/',
  ],
  practices: [
    'trust-contests',
    'breach-of-fiduciary-duty',
    'trust-accounting-disputes',
    'business-disputes',
  ],
  updatedAt: '2026-09-01',
};
