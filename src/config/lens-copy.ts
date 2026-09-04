import type { Lens, LensCopy } from '@/lib/lens/types';
import { NOTICE_ARTICLE_PATH } from './lens';
import { consultCta, site } from './site';

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

/** One of the three clocks on the homepage deadline band (components/home/deadline-cards.tsx). */
export interface DeadlineCard {
  /** The clock and its statute, e.g. "Trust contest · Probate Code § 16061.8"; rendered last, as a citation. */
  label: string;
  /** The hook question (h3), the first line of the item. */
  question: string;
  body: string;
  /** A native <details> under the body: a paragraph or a numbered list, then one link. */
  more?: {
    summary: string;
    body?: string;
    items?: readonly string[];
    link: LensLink;
  };
}

/** The card set is one slot, so a framing swaps all three clocks and the teaser together. */
export interface DeadlineCards {
  cards: readonly [DeadlineCard, DeadlineCard, DeadlineCard];
  /** One line under the cards for the visitor who thinks it is already too late (Arthur, 2026-09-03: no body). */
  teaser: { lead: string };
}

const DEADLINE_TITLE = 'Am I too late?';
const DEADLINE_CTA: LensLink = { label: 'Check my deadline', href: '/how-long-do-i-have/' };

/* Every sentence traces to src/lib/deadlines/rules*.ts and RULES.md (beneficiary side)
   or to the notice article and TRUSTEE-RULES.md (trustee side). Edit both together. */
const DEADLINE_CARDS: DeadlineCards = {
  cards: [
    {
      label: 'Trust contest · Probate Code § 16061.8',
      question: 'Did a letter called “Notification by Trustee” arrive?',
      body:
        'From the day it was mailed, you have 120 days to contest the trust. If you ask for a copy ' +
        'of the trust and it is delivered inside those 120 days, you get 60 days from that delivery ' +
        'if that is later.',
      more: {
        summary: 'What counts as notice?',
        body:
          'A written notice from the trustee saying the trust has become irrevocable, giving the ' +
          'trustee’s name and address, and warning that you have 120 days to contest it (Probate ' +
          'Code § 16061.7). It usually arrives by mail, with or without a copy of the trust.',
        link: { label: 'Read about the 120-day rule', href: '/library/?category=deadlines' },
      },
    },
    {
      label: 'Will contest · Probate Code §§ 8250, 8270',
      question: 'Has the will been filed with the court?',
      body:
        'Before a judge admits the will, you can object at or before the hearing. After the order ' +
        'admitting it, you have 120 days to ask the court to revoke it.',
    },
    {
      label: 'One year from death · Code of Civil Procedure §§ 366.2, 366.3',
      question: 'Did the person die less than a year ago?',
      body:
        'Money they owed you, property they kept, or a promise to leave you something: those ' +
        'claims must be filed within one year of the death. This limit is strict, and courts ' +
        'enforce it to the day.',
    },
  ],
  teaser: { lead: 'Talk to us anyway to confirm – there are exceptions.' },
};

const TRUSTEE_DEADLINE_CARDS: DeadlineCards = {
  cards: [
    {
      label: 'Notification by Trustee · Probate Code § 16061.7',
      question: 'Have you sent the notice yet?',
      body:
        'You have 60 days from the death to mail it to every beneficiary and every heir, ' +
        'including a child the trust left out. Serve it properly and each of them has 120 days to ' +
        'contest the trust. Serve it wrong, or leave it unsent, and their window stays open.',
      more: {
        summary: 'What has to be in it?',
        items: [
          'Who created the trust, and the date it was signed.',
          'Each trustee’s name, address, and telephone number.',
          'The address where the trust is being administered.',
          'Anything else the trust document says a notice must include.',
          'A statement that the recipient may ask for a true and complete copy of the trust.',
          'After a death, the 120-day warning in the statute’s exact words, in bold, in its own ' +
            'paragraph.',
        ],
        link: { label: 'Read the guide to the notice', href: NOTICE_ARTICLE_PATH },
      },
    },
    {
      label: 'Copy of the trust · Probate Code §§ 16061.5, 16061.8',
      question: 'Has anyone asked for a copy of the trust?',
      body:
        'Any beneficiary or heir who asks is entitled to one. If the copy is delivered inside the ' +
        '120-day window, that person’s contest deadline becomes 60 days from the delivery when ' +
        'that is later. Send the copy with the notice and only the 120-day clock is left to run.',
    },
    {
      label: 'Accountings · Probate Code §§ 16062, 16460',
      question: 'Has a beneficiary asked for an accounting?',
      body:
        'You owe every current beneficiary a written account at least once a year. One that ' +
        'fairly discloses a problem starts a three-year clock on claims about it. Without one, ' +
        'the clock runs from the day the beneficiary discovered the problem, or should have.',
    },
  ],
  teaser: { lead: 'Already been accused? The deadlines still matter.' },
};

const HOW_STEP_1 =
  'Tell us what happened, in writing or by voice, and upload what you have. We run a conflict ' +
  `check. ${site.replyPromise}`;

const WHY_FASTER_LEAD =
  'Arthur is the co-founder and CEO of Legion, an AI litigation platform. That’s why we can go ' +
  'through thousands of pages of bank records and medical files in days instead of months.';

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
  deadlineTitle: {
    neutral: DEADLINE_TITLE,
    trustee: 'Have you served the Notification by Trustee?',
    beneficiary: DEADLINE_TITLE,
  },
  deadlineCards: {
    neutral: DEADLINE_CARDS,
    trustee: TRUSTEE_DEADLINE_CARDS,
    beneficiary: DEADLINE_CARDS,
  } satisfies LensCopy<DeadlineCards>,
  deadlineCta: {
    neutral: DEADLINE_CTA,
    trustee: { label: 'How to serve the notice', href: NOTICE_ARTICLE_PATH },
    beneficiary: DEADLINE_CTA,
  } satisfies LensCopy<LensLink>,
  deadlineSecondary: {
    neutral: consultCta,
    trustee: { label: 'Check a deadline', href: '/how-long-do-i-have/' },
    beneficiary: consultCta,
  } satisfies LensCopy<LensLink>,
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
      'through years of trust statements and your own records in days instead of months.',
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
