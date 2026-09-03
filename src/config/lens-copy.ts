import type { Lens, LensCopy } from '@/lib/lens/types';
import { NOTICE_ARTICLE_PATH } from './lens';
import { site } from './site';

/**
 * Copy for every lens slot (docs/LENS.md §4). Strings, not JSX: `[label](/href/)`
 * becomes a link and `*word*` the italic em-word (components/lens/LensText).
 * Where two lenses share a value they share the constant, so the export holds
 * the text once. Each framed variant keeps one clause for the other side.
 */

export interface LensLink {
  label: string;
  href: string;
}

/** The quiet escape hatch at the end of the hero sub-line. */
export interface LensSwitch extends LensLink {
  to: Lens;
}

const HERO_TITLE = 'We handle trust and will disputes for families in San Jose and the Bay Area.';
const HERO_SUB =
  'A sibling changed the trust. The trustee won’t show the accounting. Someone got to Dad before ' +
  'he died. We represent beneficiaries who were cut out and trustees who are being accused. ' +
  'Deadlines can be as short as 120 days – [check yours before it runs](/how-long-do-i-have/).';

const DEADLINE_EYEBROW = 'Am I too late?';
const DEADLINE_TITLE = 'Most trust contests run on a 120-day clock. Some have less.';
const DEADLINE_BODY =
  'Once a trustee mails the notice required by Probate Code § 16061.7, you usually have 120 days ' +
  'to contest the trust. Will contests, elder abuse claims, and accounting disputes each have ' +
  'their own clock. Answer four questions and we’ll tell you which deadlines probably apply to you.';
const DEADLINE_CTA: LensLink = { label: 'Check my deadline', href: '/how-long-do-i-have/' };
const DEADLINE_SECONDARY = 'Or [tell us your story](/contact/)';

const HOW_STEP_1 =
  'Tell us what happened, in writing or by voice, and upload what you have. We run a conflict ' +
  `check. ${site.replyPromise}`;

const WHY_FASTER_LEAD =
  'Arthur is the co-founder and CEO of Legion, an AI litigation platform. That’s why we can go ' +
  'through thousands of pages of bank records and medical files in days instead of months, and ' +
  'why our drafting doesn’t sit in a queue.';

const LIBRARY_LEAD =
  'Deadlines, trust contests, trustees who won’t account, elder financial abuse. Plain English, ' +
  'written by the lawyers who handle these cases.';

export const lensCopy = {
  heroTitle: {
    neutral: HERO_TITLE,
    trustee: 'You’re the trustee. Now you’re the one being accused.',
    beneficiary: HERO_TITLE,
  },
  heroSub: {
    neutral: HERO_SUB,
    trustee:
      'A beneficiary demanded an accounting. A sibling filed to remove you. Someone is calling it ' +
      'elder abuse. We also represent beneficiaries, so we know what is coming. The 120-day clock ' +
      `starts when you serve the notice – [serve it right](${NOTICE_ARTICLE_PATH}).`,
    beneficiary: HERO_SUB,
  },
  heroSwitch: {
    neutral: null,
    trustee: {
      label: 'Reading this as a beneficiary? Start here.',
      href: '/trust-contests/',
      to: 'beneficiary',
    },
    beneficiary: {
      label: 'Are you the trustee? Start here.',
      href: '/for-trustees/',
      to: 'trustee',
    },
  } satisfies LensCopy<LensSwitch | null>,
  deadlineEyebrow: {
    neutral: DEADLINE_EYEBROW,
    trustee: 'Did the clock start?',
    beneficiary: DEADLINE_EYEBROW,
  },
  deadlineTitle: {
    neutral: DEADLINE_TITLE,
    trustee: 'The 120-day clock is yours to start.',
    beneficiary: DEADLINE_TITLE,
  },
  deadlineBody: {
    neutral: DEADLINE_BODY,
    trustee:
      'Once you serve the Notification by Trustee required by Probate Code § 16061.7, the ' +
      'beneficiaries have 120 days to contest the trust, or 60 days from the day they get a copy ' +
      'of the trust terms, whichever is later (Probate Code § 16061.8). You have 60 days from the ' +
      'death to serve it. Serve it wrong, or hold the trust copy back, and the window stays open. ' +
      'We represent beneficiaries as well, so we know exactly what they look for in a notice.',
    beneficiary: DEADLINE_BODY,
  },
  deadlineCta: {
    neutral: DEADLINE_CTA,
    trustee: { label: 'How to serve the notice', href: NOTICE_ARTICLE_PATH },
    beneficiary: DEADLINE_CTA,
  } satisfies LensCopy<LensLink>,
  deadlineSecondary: {
    neutral: DEADLINE_SECONDARY,
    trustee: 'Or [check a deadline](/how-long-do-i-have/)',
    beneficiary: DEADLINE_SECONDARY,
  },
  howStep1: {
    neutral: HOW_STEP_1,
    trustee:
      'You tell us what has been demanded of you and send the trust, the notice you served, and ' +
      `your records. We run a conflict check. ${site.replyPromise}`,
    beneficiary: HOW_STEP_1,
  },
  whyFasterLead: {
    neutral: WHY_FASTER_LEAD,
    trustee:
      'Arthur is the co-founder and CEO of Legion, an AI litigation platform. That’s why we can go ' +
      'through years of trust statements and your own records in days instead of months, and why ' +
      'our drafting doesn’t sit in a queue.',
    beneficiary: WHY_FASTER_LEAD,
  },
  libraryLead: {
    neutral: LIBRARY_LEAD,
    trustee:
      'Serving the notice, answering an accounting demand, responding to a removal petition, ' +
      'paying your lawyer from the trust. Plain English, written by lawyers who defend trustees ' +
      'and represent beneficiaries.',
    beneficiary: LIBRARY_LEAD,
  },
} satisfies Record<string, LensCopy<unknown>>;
