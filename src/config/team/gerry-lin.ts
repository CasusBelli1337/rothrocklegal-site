/**
 * Gerry Lin – TEAM-DOSSIER.md §1 (2026-09-01). State Bar #366572, Active,
 * admitted 2025-12-12 [CalBar]. "Associate Attorney" is Arthur's call
 * (2026-09-01). J.D. 2016, UT Austin, and the 2018–2025 work history come from
 * the dossier's LinkedIn Addendum (self-reported). The Addendum flags the
 * "provisionally licensed" label for the 2023–2025 work, so the bio says
 * "worked at" instead; the remote-from-Texas line stays out.
 */

import { headshot, type TeamMember } from './member';

export const gerryLin: TeamMember = {
  slug: 'gerry-lin',
  name: 'Gerry Lin',
  title: 'Associate Attorney',
  barStatus: 'Licensed in California, State Bar #366572 (2025)',
  barNumber: '366572',
  focus: 'Motions, discovery, and cite-checked briefs',
  // Bio paragraph 1: cite-checks and fact-checks every brief before it is filed.
  proofLine: 'Cite-checks every brief before it is filed',
  summary:
    "Gerry Lin drafts and checks the motions, discovery, and briefs in the firm's trust and " +
    'estate cases. A 2016 Santa Clara University School of Law graduate, he was admitted to the ' +
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
    'Gerry earned his J.D. at Santa Clara University School of Law in 2016, in the same class ' +
      'as Arthur and JJ, after undergraduate studies at the University of Texas at Austin. He ' +
      'clerked at two law firms from 2018 to 2020, worked at two law offices from 2023 to 2025, ' +
      'and was admitted to the State Bar of California on December 12, 2025 (Bar No. 366572). ' +
      'He joined Rothrock Legal in 2025.',
  ],
  image: headshot('gerry-lin', 'Gerry Lin, Associate Attorney at Rothrock Legal'),
  credentials: [],
  leadership: [],
  education: [{ school: 'Santa Clara University School of Law', degree: 'J.D.', year: '2016' }],
  memberships: [],
  appearances: [],
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/366572',
    'https://www.linkedin.com/in/gerry-lin-34862894/',
  ],
  practices: ['trust-accounting-disputes', 'breach-of-fiduciary-duty', 'trust-contests'],
  updatedAt: '2026-09-01',
};
