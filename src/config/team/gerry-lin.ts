/**
 * Gerry Lin – TEAM-DOSSIER.md §1 (2026-09-01). State Bar #366572, Active,
 * admitted 2025-12-12 [CalBar]. The dossier's [CONFIRM] items (Associate title,
 * J.D. year, undergrad, remote-from-Texas line, PLL mention) are left out
 * rather than published; "Attorney" is the title the dossier calls accurate.
 */

import { headshot, type TeamMember } from './member';

export const gerryLin: TeamMember = {
  slug: 'gerry-lin',
  name: 'Gerry Lin',
  title: 'Attorney',
  barStatus: 'Licensed in California, State Bar #366572 (2025)',
  barNumber: '366572',
  focus: 'Motions, discovery, and cite-checked briefs',
  summary:
    "Gerry Lin drafts and checks the motions, discovery, and briefs in the firm's trust and " +
    'estate cases. A Santa Clara University School of Law graduate, he was admitted to the ' +
    'California bar in December 2025.',
  bio: [
    'Gerry Lin handles the writing that trust and estate litigation runs on. When a trustee ' +
      'will not produce an accounting, a sibling contests a trust amendment, or a witness needs ' +
      'to be compelled to sit for a deposition, someone has to turn the facts into a motion the ' +
      'probate judge can act on. At Rothrock Legal that is often Gerry. He drafts motions to ' +
      'compel, meet-and-confer letters, discovery responses, and supporting declarations, and he ' +
      'cite-checks and fact-checks every brief before it is filed.',
    "He also works inside the firm's AI-assisted drafting process. Rothrock Legal drafts with " +
      'tools built by Legion, the litigation platform Arthur co-founded, and Gerry is one of the ' +
      'people who reads what the tools produce, checks it against the record, and fixes what ' +
      'needs fixing. The judge sees the finished brief. Gerry sees every version before that.',
    'Gerry joined Rothrock Legal in 2025 and was admitted to the State Bar of California on ' +
      'December 12, 2025 (Bar No. 366572). He earned his J.D. at Santa Clara University School ' +
      'of Law, the same school as Arthur.',
  ],
  image: headshot('gerry-lin', 'Gerry Lin, attorney at Rothrock Legal'),
  credentials: [],
  leadership: [],
  education: [{ school: 'Santa Clara University School of Law', degree: 'J.D.' }],
  memberships: [],
  appearances: [],
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/366572',
    'https://www.linkedin.com/in/gerry-lin-34862894/',
  ],
  practices: ['trust-accounting-disputes', 'breach-of-fiduciary-duty', 'trust-contests'],
  updatedAt: '2026-09-01',
};
