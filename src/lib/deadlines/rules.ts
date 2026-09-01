/**
 * The deadline rule table. Config over code: each rule declares who it applies
 * to, the clock(s) it runs, and its plain-English copy. `compute.ts` turns the
 * table into dated results. Every statute here was verified against the text
 * on leginfo.legislature.ca.gov – see RULES.md beside this file. The two
 * contest rules live in rules-contests.ts.
 */
import { TRUST_CONTEST_RULE, WILL_CONTEST_RULE } from './rules-contests';
import {
  FOUR_MONTHS,
  FOUR_YEARS,
  hasConcern,
  ONE_YEAR,
  SIXTY_DAYS,
  statuteUrl,
  THREE_YEARS,
  validDate,
} from './rules-shared';
import type { Clock, DeadlineRule, WizardAnswers } from './types';

const deathStart = (a: WizardAnswers) => validDate(a.deathDate);
const needDeathDate = () => 'Tell us the date of death and we will estimate this deadline.';

const creditorClocks: readonly Clock[] = [
  {
    from: 'the day the court issued letters',
    period: FOUR_MONTHS,
    start: (a) => validDate(a.lettersDate),
  },
  {
    from: 'the day the Notice of Administration was mailed',
    period: SIXTY_DAYS,
    start: (a) => validDate(a.noticeOfAdministrationDate),
  },
];

const breachClocks: readonly Clock[] = [
  {
    from: 'the day you received the accounting',
    period: THREE_YEARS,
    start: (a) => (a.accounting === 'received' ? validDate(a.accountingDate) : undefined),
  },
  {
    from: 'the day you first suspected a problem',
    period: THREE_YEARS,
    start: (a) => (a.accounting === 'received' ? undefined : validDate(a.breachDiscoveryDate)),
  },
];

function breachCaveats(a: WizardAnswers): string[] {
  const out: string[] = [];
  if (a.accounting === 'received') {
    out.push(
      'Three years from the accounting applies only if the accounting fairly disclosed the ' +
        'problem. If it hid the problem, the clock runs from when you discovered it or should ' +
        'have. A lawyer should read the accounting.',
    );
  }
  out.push(
    'If the trustee asked a court to approve the accounting, you may need to object by the ' +
      'hearing date on the notice, which can be much sooner.',
  );
  return out;
}

export const DEADLINE_RULES: readonly DeadlineRule[] = [
  TRUST_CONTEST_RULE,
  WILL_CONTEST_RULE,
  {
    id: 'broken-promise',
    label: 'Enforce a promise to leave you something',
    statute: 'Code of Civil Procedure § 366.3',
    statuteUrl: statuteUrl('CCP', '366.3'),
    description:
      'If the person promised to leave you something from their estate or trust, in writing or ' +
      'out loud, and the promise was broken, you have one year from the date of death to sue.',
    whyItMatters:
      'This one-year limit is strict. The statute says it cannot be extended, and courts enforce ' +
      'it to the day.',
    applies: (a) => hasConcern(a, 'broken-promise'),
    clocks: [{ from: 'the date of death', period: ONE_YEAR, start: deathStart }],
    notStarted: needDeathDate,
    caveats: () => ['It does not matter whether the promise was in writing.'],
  },
  {
    id: 'claims-against-decedent',
    label: 'Claims against the person who died',
    statute: 'Code of Civil Procedure § 366.2',
    statuteUrl: statuteUrl('CCP', '366.2'),
    description:
      'Any claim you could have brought against the person while they were alive, such as money ' +
      'they owed you or property they kept, must be filed within one year of their death.',
    whyItMatters:
      'This limit replaces the longer time you would have had while they were alive, and it runs ' +
      'even if no probate case has been opened.',
    applies: (a) => hasConcern(a, 'owed-money'),
    clocks: [{ from: 'the date of death', period: ONE_YEAR, start: deathStart }],
    notStarted: needDeathDate,
    caveats: () => [
      "If a probate case is open, you usually also need to file a creditor's claim in that case. " +
        "See the creditor's claim deadline.",
    ],
  },
  {
    id: 'creditor-claim',
    label: "File a creditor's claim in the probate case",
    statute: 'Probate Code § 9100',
    statuteUrl: statuteUrl('PROB', '9100'),
    description:
      'Once the court appoints an executor or administrator (the court "issues letters"), you ' +
      "must file a creditor's claim within four months of that date, or within 60 days after a " +
      'Notice of Administration is mailed to you, whichever is later.',
    whyItMatters: 'A claim filed late is barred, and the estate can pay everyone else first.',
    applies: (a) => hasConcern(a, 'owed-money'),
    clocks: creditorClocks,
    notStarted: () =>
      'This clock starts when the court appoints an executor or administrator. You told us that ' +
      'has not happened, or you are not sure, so it has not started. The one-year limit from the ' +
      'date of death runs no matter what. Watch the court file and be ready to file a claim the ' +
      'day the estate opens.',
    caveats: () => [
      "Filing a creditor's claim is separate from filing a lawsuit. If the claim is rejected, a " +
        'lawsuit has its own short deadline.',
      'This rule is for a probate estate. Claims against a trust follow different rules.',
    ],
  },
  {
    id: 'elder-abuse',
    label: 'Financial elder abuse',
    statute: 'Welfare & Institutions Code § 15657.7',
    statuteUrl: statuteUrl('WIC', '15657.7'),
    description:
      'A lawsuit for financial abuse of an elder (age 65 or older) or a dependent adult must be ' +
      'filed within four years of the day you discovered the abuse, or should have discovered ' +
      'it with reasonable care.',
    whyItMatters:
      'Four years sounds like a lot, but the clock can start earlier than you think: on the day ' +
      'a reasonable person would have noticed, not the day you were certain.',
    applies: (a) => hasConcern(a, 'elder-abuse'),
    clocks: [
      {
        from: 'the day you first learned of the abuse',
        period: FOUR_YEARS,
        start: (a) => validDate(a.abuseDiscoveryDate),
      },
    ],
    notStarted: () =>
      'Tell us when you first learned of the abuse and we will estimate this deadline.',
    caveats: () => [
      'If the person who took the money has died, claims against them may be cut to one year ' +
        'from their death (Code of Civil Procedure § 366.2). Tell us if that is the case.',
      'Elder abuse claims often overlap with a trust or will contest. The shorter deadline ' +
        'decides what you must do first.',
    ],
  },
  {
    id: 'breach-of-trust',
    label: 'Breach of trust by the trustee',
    statute: 'Probate Code § 16460',
    statuteUrl: statuteUrl('PROB', '16460'),
    description:
      'If the trustee gave you a written accounting or report that fairly disclosed the problem, ' +
      'you have three years from the day you received it. If there was no accounting, or it hid ' +
      'the problem, you have three years from the day you discovered the problem or should have.',
    whyItMatters:
      'Trustees use this rule to shut down claims about money that went missing years ago. Once ' +
      'an accounting lands in your mailbox, the clock is ticking.',
    applies: (a) => hasConcern(a, 'trustee-accounting'),
    clocks: breachClocks,
    notStarted: (a) =>
      a.accounting === 'received'
        ? 'Tell us the date you received the accounting and we will estimate this deadline.'
        : 'Tell us when you first suspected a problem and we will estimate this deadline.',
    caveats: breachCaveats,
  },
];
