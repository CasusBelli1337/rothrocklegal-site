/**
 * Shapes shared by the deadline wizard: the visitor's answers, the rule
 * config, and the computed results. Every date is an ISO calendar date
 * (YYYY-MM-DD) in the visitor's local calendar – never a timestamp.
 */

export type Instrument = 'trust' | 'will' | 'both' | 'not-sure';
export type YesNoUnsure = 'yes' | 'no' | 'not-sure';
export type TrustCopyStatus = 'received' | 'not-asked' | 'asked-not-received' | 'not-sure';
export type ProbateStatus = 'admitted' | 'filed' | 'not-filed' | 'not-sure';
export type AccountingStatus = 'received' | 'not-received' | 'not-sure';
export type Concern = 'elder-abuse' | 'broken-promise' | 'trustee-accounting' | 'owed-money';

export interface WizardAnswers {
  deathDate?: string;
  instrument?: Instrument;
  noticeServed?: YesNoUnsure;
  noticeDate?: string;
  trustCopy?: TrustCopyStatus;
  trustCopyDate?: string;
  probateStatus?: ProbateStatus;
  probateDate?: string;
  concerns?: Concern[];
  abuseDiscoveryDate?: string;
  accounting?: AccountingStatus;
  accountingDate?: string;
  breachDiscoveryDate?: string;
  lettersDate?: string;
  noticeOfAdministrationDate?: string;
}

/** Answer keys that hold an ISO date. */
export type DateAnswerKey =
  | 'deathDate'
  | 'noticeDate'
  | 'trustCopyDate'
  | 'probateDate'
  | 'abuseDiscoveryDate'
  | 'accountingDate'
  | 'breachDiscoveryDate'
  | 'lettersDate'
  | 'noticeOfAdministrationDate';

export type DeadlineId =
  | 'trust-contest'
  | 'will-contest'
  | 'broken-promise'
  | 'claims-against-decedent'
  | 'creditor-claim'
  | 'elder-abuse'
  | 'breach-of-trust';

/** A statutory period. Exactly one of days / months / years is set. */
export interface Period {
  days?: number;
  months?: number;
  years?: number;
  /** Plain English, e.g. "120 days", "one year". */
  label: string;
}

/**
 * One clock inside a rule. A rule with several clocks gives the visitor the
 * LATER of the clocks that have started (§ 16061.8, § 9100).
 */
export interface Clock {
  /** What the clock counts from, e.g. "the day the trustee's notice was mailed". */
  from: string;
  period: Period;
  /** ISO start date, or undefined when this clock has not started. */
  start(answers: WizardAnswers): string | undefined;
}

export interface DeadlineRule {
  id: DeadlineId;
  label: string;
  statute: string;
  statuteUrl: string;
  /** The rule in plain English. */
  description: string;
  whyItMatters: string;
  applies(answers: WizardAnswers): boolean;
  clocks: readonly Clock[];
  /** Shown when no clock has started. Never says "unlimited time". */
  notStarted(answers: WizardAnswers): string;
  caveats(answers: WizardAnswers): string[];
}

export type DeadlineStatus = 'open' | 'urgent' | 'passed' | 'not-started';

export interface DeadlineResult {
  id: DeadlineId;
  label: string;
  statute: string;
  statuteUrl: string;
  description: string;
  whyItMatters: string;
  /** ISO date after the weekend / court-holiday roll, or null when not started. */
  deadline: string | null;
  /** Calendar days from today to the deadline (negative once passed), or null. */
  daysRemaining: number | null;
  status: DeadlineStatus;
  /** How the date was computed, or why there is no date yet. */
  explanation: string;
  caveats: string[];
}
