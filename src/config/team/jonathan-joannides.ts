/**
 * Jonathan Joannides – TEAM-DOSSIER.md §2 and its LinkedIn Addendum
 * (2026-09-01). State Bar #311260, Active [CalBar]. "Of Counsel" is Arthur's
 * call (2026-09-01). "Jonathan", never "JJ", in professional contexts (Arthur,
 * 2026-09-04), and the bio says he founded Digital Frontier Law without
 * describing what he does there today. Firm tenures, awards, the degrees,
 * CIPP, and HomeFirst come from LinkedIn (self-reported). Still out: N.D. Cal.
 * admission, Wine Country Marines. "Practiced at" Wilson Sonsini and Fenwick,
 * never "over a decade" (about 5.5 years combined; RPC 7.1). No graduation or
 * bar-admission years anywhere (Arthur, 2026-09-04).
 */

import { headshot, type TeamMember } from './member';

export const jonathanJoannides: TeamMember = {
  slug: 'jonathan-joannides',
  name: 'Jonathan Joannides',
  title: 'Of Counsel',
  barStatus: 'Licensed in California, State Bar #311260',
  barNumber: '311260',
  focus: 'Trust and estate litigation; privacy and cybersecurity',
  summary:
    'Litigator and former U.S. Marine Corps infantry captain, Of Counsel to Rothrock Legal in ' +
    'San Jose. Founder of Digital Frontier Law and President of the Honorable William A. ' +
    'Ingram American Inn of Court.',
  bio: [
    'Jonathan Joannides is a litigator and a former U.S. Marine Corps infantry officer. He is ' +
      "Of Counsel to Rothrock Legal on the firm's trust and estate cases, and he is President " +
      'of the Honorable William A. Ingram American Inn of Court, the Santa Clara County chapter ' +
      'of a national organization devoted to skill and civility in the courtroom.',
    'Before law school he served nearly ten years in the Marine Corps as an infantry officer ' +
      'and captain. He led infantry platoons in combat in Iraq, ran counter-piracy operations ' +
      'off the coast of Somalia, and advised U.S. diplomatic posts in Bahrain and Pakistan on ' +
      'security.',
    'He went from the Marines to Santa Clara University School of Law, where he and Arthur were ' +
      'classmates, then practiced at Wilson Sonsini in Palo Alto, which gave him its John Wilson ' +
      "Award, the firm's highest pro bono honor, and its Pro Bono Award, and at Fenwick & West, " +
      'advising companies from startups to the Fortune 500 on privacy and cybersecurity. He ' +
      'founded Digital Frontier Law, APC, a San Jose firm focused on AI, privacy, cybersecurity, ' +
      'and intellectual property.',
    'Jonathan holds a J.D. from Santa Clara University School of Law, a Master of Information ' +
      'and Cybersecurity from UC Berkeley, and a B.S. in Computer Science and Mathematics from ' +
      'the University of Minnesota. He is certified as a CIPP/E and CIPP/US privacy professional ' +
      'and is a member of the State Bar of California.',
    'He served six years on the board of HomeFirst, the largest provider of shelter and ' +
      'services to people without homes in Santa Clara County, including a term as its chairman.',
  ],
  image: headshot('jonathan-joannides', 'Jonathan Joannides, Of Counsel at Rothrock Legal'),
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
    { school: 'Santa Clara University School of Law', degree: 'J.D.' },
    { school: 'UC Berkeley', degree: 'Master of Information and Cybersecurity' },
    { school: 'University of Minnesota', degree: 'B.S., Computer Science and Mathematics' },
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
  updatedAt: '2026-09-04',
};
