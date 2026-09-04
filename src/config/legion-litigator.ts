/**
 * The Legion Litigator designation (Arthur, 2026-09-04): a mark for lawyers
 * who commit to using AI responsibly, so that clients get more work, sooner,
 * for less, with a lawyer making every decision and standing behind every
 * filing. Arthur is the first to carry it; the long-term plan is a designation
 * other lawyers can earn and show on their own sites, so the seal
 * (components/legion/LegionLitigatorSeal.tsx) is built to be packaged.
 * Every word the two sections share lives here; the "faster" commitment's body
 * is a lens slot in lens-copy.ts. Never a pitch to lawyers: the copy speaks to
 * the family whose case it is.
 */

export interface Commitment {
  lead: string;
  /** Omitted for the commitment whose body is the `why-faster-lead` lens slot. */
  body?: string;
}

export const legionLitigator = {
  name: 'Legion Litigator',
  /** The homepage section. */
  home: {
    eyebrow: 'Legion Litigator',
    title: 'An AI-enabled practice, with a lawyer behind every page.',
    lead:
      'Arthur Rothrock is the co-founder and CEO of Legion, an AI litigation platform built for ' +
      'California litigators, and the first lawyer to carry the Legion Litigator designation. ' +
      'Here is what that means for your case.',
    link: { label: 'How the firm uses AI', href: '/about/#ai-enabled-practice' },
  },
  /** The designation block on the About page. */
  about: {
    title: 'The Legion Litigator designation',
    meaning:
      'A Legion Litigator is a lawyer who commits to using AI responsibly: to do more for ' +
      'clients, sooner, at a lower cost, with a lawyer making every decision and standing ' +
      'behind every filing.',
    first:
      'Arthur is the first lawyer to carry the designation. The commitments below are what it ' +
      'stands for, and what you can hold this firm to.',
  },
  commitments: [
    {
      lead: 'The technology reads. A lawyer decides.',
      body:
        'AI organizes the records and writes the first drafts. It decides nothing. The lawyer ' +
        'who signs a filing is the one who answers for it in court.',
    },
    { lead: 'Faster where it matters.' },
    {
      lead: 'Your information stays protected.',
      body:
        'What you send is used for your case and handled under a lawyer’s duty of ' +
        'confidentiality, the same as everything else a lawyer holds.',
    },
    {
      lead: 'The savings are yours.',
      body:
        'Fewer hours billed for organizing and drafting. More of your budget on the work that ' +
        'moves the case.',
    },
  ] as readonly Commitment[],
  /** The seal's words. The ring is centred on 12 o'clock with its gap at the bottom; keep it short enough to fit once. */
  seal: {
    ring: 'LEGION LITIGATOR · RESPONSIBLE AI IN LEGAL PRACTICE · A LAWYER BEHIND EVERY FILING',
    word: 'LITIGATOR',
    line: 'No. 001 · Est. 2026',
    title: 'Legion Litigator designation, No. 001, established 2026',
  },
} as const;
