import { site } from '@/config/site';
import type { FaqItem } from '@/types/content';

/**
 * The two trustee-side questions (docs/LENS.md §4f). Answers stay conditional
 * and cite the statute (TRUSTEE-RULES.md §2–§3); nothing promises an outcome.
 */
export const trusteeFeesFaq: FaqItem = {
  question: 'Can the trust pay for my lawyer?',
  answer:
    'Often, if you are defending the trust or your administration of it in good faith. A trustee ' +
    'may hire a lawyer (Probate Code section 16247) and is repaid from the trust for expenses ' +
    'properly incurred in administering it (Probate Code section 15684). The trust does not pay ' +
    'for your side of a fight over who gets what, and fees already paid can be charged back to ' +
    'you if the court finds a breach. We tell you where that line runs before the first invoice ' +
    'goes to the trust.',
};

export const trusteeAccountingFaq: FaqItem = {
  question: 'A beneficiary demanded an accounting. How long do I have?',
  answer:
    'Sixty days is the number to work from. A beneficiary who asks in writing can go to court to ' +
    'compel an accounting once 60 days pass without one, if none was given in the six months ' +
    'before the request (Probate Code section 17200(b)(7)). A written request for information ' +
    'gets the same 60-day treatment (Probate Code sections 16061 and 17200(b)(7)), and ' +
    'beneficiaries entitled to distributions are owed an accounting at least once a year ' +
    '(Probate Code section 16062). Some trusts change these rules, so send us the trust and the ' +
    'request before you answer.',
};

/**
 * Homepage FAQ (HOMEPAGE-SPEC §8) plus the two trustee questions last; the
 * trustee lens moves those two first. The fee answer is Arthur's wording
 * (2026-09-01); the model is not final.
 */
export const homeFaq: readonly FaqItem[] = [
  {
    question: 'What does it cost to contest a trust or will?',
    answer:
      'We give you a written fee estimate before any work starts. Most trust and estate cases ' +
      'are billed hourly, with Arthur and Jonathan on strategy, depositions, and hearings and ' +
      'the associates handling the document work at lower rates. Tell us about your situation ' +
      'and we will tell you what it would take.',
  },
  {
    question: 'Do I have a case?',
    answer:
      'Usually we can tell you after one conversation and a look at the documents. The three ' +
      'things that matter most: what changed, who benefited, and when you found out.',
  },
  {
    question: 'How long does a trust contest take?',
    answer:
      "Months to a couple of years depending on the court's calendar and whether the other side " +
      'wants to settle. Many resolve at mediation.',
  },
  {
    question: 'Can this be resolved without a trial?',
    answer:
      'Often, yes. Most trust and estate disputes settle. We prepare every case as if it will be ' +
      'tried, which is usually what gets it settled.',
  },
  {
    question: 'Which courts do you appear in?',
    answer:
      'Santa Clara County Superior Court – Probate Division in San Jose most often, plus San ' +
      'Mateo, Alameda, and San Francisco Superior Courts. By video anywhere in California.',
  },
  trusteeFeesFaq,
  trusteeAccountingFaq,
];

export interface FaqGroup {
  title: string;
  items: readonly FaqItem[];
}

/** Firm FAQ page (/faq/). The last group rebuilds the four legacy questions in plain English. */
export const faqGroups: readonly FaqGroup[] = [
  {
    title: 'Costs and the first conversation',
    items: [
      homeFaq[0],
      {
        question: 'What should I send with my consult request?',
        answer:
          'Whatever you have: the trust or will in any version, amendments, the notice letter and ' +
          'its envelope, letters from the trustee or their lawyer, and a short timeline of who died ' +
          'when and what changed. Do not worry about organizing it. Photos of documents are fine, ' +
          'and you can upload them with the request.',
      },
      homeFaq[1],
      {
        question: 'Who pays the legal fees in a trust dispute?',
        answer:
          'Usually each side pays its own. The exceptions matter: a trustee who breached their ' +
          'duties can be ordered to pay fees personally, financial elder abuse claims carry a ' +
          'statutory fee award (Welfare and Institutions Code section 15657.5), and some trusts and ' +
          'contracts have fee clauses. We cover this in the first conversation.',
      },
    ],
  },
  {
    title: 'Deadlines',
    items: [
      {
        question: 'How long do I have to contest a trust in California?',
        answer:
          'Usually 120 days from the date the trustee serves the notice required by Probate Code ' +
          'section 16061.7, or 60 days from delivery of the trust terms, whichever is later ' +
          '(Probate Code section 16061.8). Deadlines depend on your facts; confirm yours with a lawyer.',
      },
      {
        question: 'How long do I have to contest a will?',
        answer:
          'You can object before the will is admitted to probate. Once it is admitted, a petition ' +
          'to revoke probate must be filed within 120 days (Probate Code section 8270).',
      },
      {
        question: 'What if I never received a notice?',
        answer:
          'Then the 120-day trust contest window may not have started, but do not rely on that. ' +
          'Notices get served at old addresses, and other claims run on their own clocks. Bring us ' +
          'whatever mail you have.',
      },
      {
        question: 'Is there a deadline for financial elder abuse claims?',
        answer:
          'Four years from when the abuse was discovered or reasonably should have been ' +
          '(Welfare and Institutions Code section 15657.7). If the wrongdoer has died, claims ' +
          'against their estate can be limited to one year from death.',
      },
    ],
  },
  {
    title: 'The process',
    items: [
      homeFaq[2],
      homeFaq[3],
      {
        question: 'Will I have to testify?',
        answer:
          'If the case goes to trial, probably yes, and you may give a deposition before that. We ' +
          'prepare you for both. Most cases settle before either becomes necessary.',
      },
      {
        question: 'Can we meet by video?',
        answer:
          'Yes. We meet by video by default, and in person by appointment when the case calls ' +
          'for it. No office visits, no parking, no waiting rooms. Court appearances happen in ' +
          'the courtroom.',
      },
    ],
  },
  {
    title: 'For trustees',
    items: [trusteeFeesFaq, trusteeAccountingFaq],
  },
  {
    title: 'Courts and where we practice',
    items: [
      homeFaq[4],
      {
        question: 'Do you take cases outside Santa Clara County?',
        answer:
          'Yes, throughout the Bay Area: San Mateo, Alameda, and San Francisco Superior Courts ' +
          'regularly, and elsewhere in California by video and travel when the case calls for it.',
      },
    ],
  },
  {
    title: 'The firm and how we use technology',
    items: [
      {
        question: 'How does Rothrock Legal use AI?',
        answer:
          'Arthur is the co-founder and CEO of Legion, an AI litigation platform. We use it to go ' +
          'through bank records and medical files and to prepare drafts in days instead of months. ' +
          'Lawyers make every judgment call, check every citation, and sign everything that goes ' +
          'to court.',
      },
      {
        question: 'What makes Rothrock Legal different from other firms?',
        answer:
          'A small firm focused on trust and estate litigation, run by a trial lawyer who also ' +
          'builds litigation software. We are fully remote. The same AI platform Legion builds ' +
          'for litigators does the reading and the first drafts, the associates handle the ' +
          'document work at lower rates, and a lawyer makes every judgment call. You talk to the ' +
          'people doing the work.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Request a consult online. Tell us what happened, in writing or by voice, and upload ' +
          'what you have. We read it, run a conflict check, and tell you which deadlines matter ' +
          `before anything else. ${site.replyPromise}`,
      },
      {
        question: 'What is Legion, and how does it relate to Rothrock Legal?',
        answer:
          'Legion is an AI litigation platform that Arthur co-founded and runs as CEO. Rothrock ' +
          'Legal is a separate law firm that uses Legion in its own cases. The software does not ' +
          'give legal advice; the lawyers do, and they are responsible for every word that is filed.',
      },
    ],
  },
];

export const allFaqItems: readonly FaqItem[] = faqGroups.flatMap((g) => g.items);
