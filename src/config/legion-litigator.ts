/**
 * The Legion AI Litigator seal (Arthur, 2026-09-04): a mark for a practice
 * that has committed to using AI responsibly at every level of a client's
 * case. The long-term plan is a designation other lawyers earn and show, and
 * a question clients learn to ask, so the seal
 * (components/legion/LegionLitigatorSeal.tsx) is built to be packaged and the
 * words stay high level: what the seal promises, never who conferred it and
 * never the mechanics ("organizing records" is out). Every word the two
 * sections share lives here; the "technology" commitment's body is a lens
 * slot in lens-copy.ts. Never a pitch to lawyers: the copy speaks to the
 * family whose case it is, and never promises an outcome.
 */

export interface Commitment {
  lead: string;
  /** Omitted for the commitment whose body is the `why-faster-lead` lens slot. */
  body?: string;
}

export const legionLitigator = {
  name: 'Legion AI Litigator',
  /** The homepage section. */
  home: {
    eyebrow: 'Legion AI Litigator',
    title: 'AI, used responsibly at every level of your case.',
    lead:
      'Rothrock Legal carries the Legion AI Litigator seal. It stands for four commitments ' +
      'about how AI is used for the people this firm represents: to safeguard what you share, ' +
      'to keep a lawyer in charge of every decision, to bring the best technology available to ' +
      'the work, and to pass the savings on to you.',
    link: { label: 'What the seal means', href: '/about/#ai-enabled-practice' },
  },
  /** The designation block on the About page. */
  about: {
    title: 'The Legion AI Litigator seal',
    meaning:
      'A Legion AI Litigator is a lawyer who has committed to using AI responsibly at every ' +
      'level of a client’s case: the research, the drafting, and the strategy, with a lawyer in ' +
      'charge of every decision, the client’s information safeguarded, and the savings passed on.',
    ask:
      'Whoever you talk to about your case, it is a fair question to ask: is AI being used on ' +
      'my matter, and who is in charge of it? This seal is one firm’s answer, in writing. The ' +
      'commitments below are what you can hold us to.',
  },
  commitments: [
    {
      lead: 'Your information is safeguarded.',
      body:
        'Everything you share is protected by a lawyer’s duty of confidentiality and handled on ' +
        'systems built for law firms, under the same rules as everything else a lawyer holds.',
    },
    {
      lead: 'A lawyer is in charge at every step.',
      body:
        'AI never decides anything. A lawyer directs the research, shapes the strategy, signs ' +
        'every filing, and answers for it in court.',
    },
    { lead: 'The best technology, on the hard parts.' },
    {
      lead: 'The savings are yours.',
      body:
        'The hours the technology saves are hours you are not billed for. More of your budget ' +
        'goes to the judgment and the advocacy that move your case.',
    },
  ] as readonly Commitment[],
  /**
   * The seal's words: the name on the top arc, three keystone words on the
   * bottom arc, the designation at the centre under the Legion mark, and the
   * year. Keep each arc short enough to sit well inside its half of the ring.
   */
  seal: {
    top: 'LEGION AI LITIGATOR',
    bottom: 'SECURE · RESPONSIBLE · ACCOUNTABLE',
    word: 'AI LITIGATOR',
    line: 'EST. 2026',
    title: 'Legion AI Litigator seal: secure, responsible, accountable use of AI, established 2026',
  },
} as const;
