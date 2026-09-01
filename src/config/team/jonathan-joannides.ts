/**
 * Jonathan "JJ" Joannides – TEAM-DOSSIER.md §2 (2026-09-01). State Bar
 * #311260, Active, admitted 2016-12-01 [CalBar]. "Of Counsel" is the
 * dossier's recommended label and is Arthur's call, so it carries [CONFIRM]
 * (the page renders noindex with a draft chip until it is cleared). Items the
 * dossier flags (CIPP, N.D. Cal. admission, MICS year, Wine Country Marines,
 * firm dates) are left out.
 */

import { headshot, type TeamMember } from './member';

export const jonathanJoannides: TeamMember = {
  slug: 'jonathan-joannides',
  name: 'Jonathan "JJ" Joannides',
  title: 'Of Counsel [CONFIRM]',
  barStatus: 'Licensed in California, State Bar #311260 (2016)',
  barNumber: '311260',
  focus: 'Case strategy, discovery disputes, and motion practice',
  summary:
    'Litigator and former U.S. Marine Corps infantry captain who works with Rothrock Legal on ' +
    'trust and estate cases. Founder of Digital Frontier Law in San Jose and President of the ' +
    'Honorable William A. Ingram American Inn of Court.',
  bio: [
    'Jonathan Joannides, JJ to everyone who works with him, is the litigator Arthur brings in ' +
      'when a trust case needs a second experienced lawyer on it. He works with Rothrock Legal ' +
      'on case strategy, discovery disputes, oppositions, and replies in trust and estate ' +
      'litigation in Santa Clara County Superior Court, including sanctions motions and ' +
      'protective orders.',
    'Before law school he served ten years in the U.S. Marine Corps as an infantry officer and ' +
      'captain. He led infantry platoons in combat in Iraq, ran counter-piracy operations off ' +
      'the coast of Somalia, and advised U.S. diplomatic posts in Bahrain and Pakistan on ' +
      'security. He went from that to Santa Clara University School of Law, then to commercial ' +
      'litigation at Wilson Sonsini in Palo Alto, then to privacy and cybersecurity work at ' +
      'Fenwick & West, advising companies from startups to the Fortune 500. In 2025 he founded ' +
      'Digital Frontier Law, APC, a San Jose firm focused on AI, privacy, cybersecurity, and ' +
      'intellectual property, which he still runs.',
    'JJ holds a J.D. from Santa Clara University School of Law (2016), a Master of Information ' +
      'and Cybersecurity from UC Berkeley, and a B.S. in Computer Science and Mathematics from ' +
      'the University of Minnesota (2003). He was admitted to the State Bar of California in ' +
      'December 2016.',
    'He is President of the Honorable William A. Ingram American Inn of Court and has served ' +
      'on the board of HomeFirst, a provider of shelter and services for people without homes ' +
      'in Santa Clara County. He and Arthur were classmates at Santa Clara Law.',
  ],
  image: headshot(
    'jonathan-joannides',
    'Jonathan "JJ" Joannides, litigator working with Rothrock Legal',
  ),
  credentials: [],
  leadership: [
    {
      role: 'President',
      organization: 'Honorable William A. Ingram American Inn of Court',
    },
  ],
  education: [
    { school: 'Santa Clara University School of Law', degree: 'J.D.', year: '2016' },
    { school: 'UC Berkeley', degree: 'Master of Information and Cybersecurity' },
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
