/**
 * The two contest rules: trust (Probate Code § 16061.8) and will
 * (Probate Code §§ 8270, 8250). Verified text and reasoning: RULES.md.
 */
import { addDays } from './dates';
import { ONE_TWENTY_DAYS, SIXTY_DAYS, statuteUrl, validDate } from './rules-shared';
import type { Clock, DeadlineRule, WizardAnswers } from './types';

const NO_UNLIMITED_TIME =
  'That does not mean you have unlimited time. The other deadlines on this page still run, ' +
  'a court can refuse a claim you sat on too long (the law calls this "laches"), and the ' +
  'trustee may hand out the trust property in the meantime.';

const involvesTrust = (a: WizardAnswers) => a.instrument !== undefined && a.instrument !== 'will';
const involvesWill = (a: WizardAnswers) => a.instrument !== undefined && a.instrument !== 'trust';

// ── Trust contest ─────────────────────────────────────────────────────────

const noticeStart = (a: WizardAnswers) =>
  a.noticeServed === 'yes' ? validDate(a.noticeDate) : undefined;

/** The 60-day clock only runs when the copy is delivered inside the 120-day window. */
function trustCopyStart(a: WizardAnswers): string | undefined {
  const notice = noticeStart(a);
  const copy = a.trustCopy === 'received' ? validDate(a.trustCopyDate) : undefined;
  if (!notice || !copy) return undefined;
  if (copy < notice || copy > addDays(notice, 120)) return undefined;
  return copy;
}

const trustClocks: readonly Clock[] = [
  { from: "the day the trustee's notice was mailed", period: ONE_TWENTY_DAYS, start: noticeStart },
  { from: 'the day the trust copy was delivered', period: SIXTY_DAYS, start: trustCopyStart },
];

function trustNotStarted(a: WizardAnswers): string {
  const lead = a.instrument === 'not-sure' ? 'If there is a trust: ' : '';
  if (a.noticeServed === 'no') {
    return (
      `${lead}You told us no trustee notice has been served. The 120-day clock in Probate Code ` +
      '§ 16061.8 starts only when the trustee serves a proper notice, so that clock has not ' +
      `started. ${NO_UNLIMITED_TIME} Ask the trustee for the notice and a copy of the trust in ` +
      'writing, and talk to a lawyer now.'
    );
  }
  if (a.noticeServed === 'yes') {
    return `${lead}Tell us the date the notice was mailed and we will estimate this deadline.`;
  }
  return (
    `${lead}If a notice was mailed to you, the 120-day clock may already be running, even if you ` +
    'never opened it. Look for a letter titled "Notification by Trustee" and ask the trustee in ' +
    'writing whether one was sent. Until you know the mailing date, treat this as urgent.'
  );
}

function trustCaveats(a: WizardAnswers): string[] {
  const out: string[] = [];
  if (a.trustCopy === 'received' && noticeStart(a) && !trustCopyStart(a)) {
    out.push(
      'You told us the trust copy arrived outside the 120-day window. The 60-day rule only ' +
        'applies when the copy is delivered inside that window, so it does not move this date.',
    );
  }
  if (a.trustCopy === 'not-asked') {
    out.push(
      'Ask the trustee in writing for a full copy of the trust today. If it is delivered inside ' +
        'the 120-day window, you get at least 60 days from the day it is delivered.',
    );
  }
  if (a.trustCopy === 'asked-not-received') {
    out.push(
      'Keep proof of your request. If the copy is delivered inside the 120-day window, you get ' +
        '60 days from that day if it is later than the 120-day date.',
    );
  }
  out.push(
    'If the notice was defective or never properly served, the 120-day clock may not have ' +
      'started. Only a lawyer who has seen the notice can tell you that.',
  );
  return out;
}

export const TRUST_CONTEST_RULE: DeadlineRule = {
  id: 'trust-contest',
  label: 'Contest the trust',
  statute: 'Probate Code § 16061.8',
  statuteUrl: statuteUrl('PROB', '16061.8'),
  description:
    'Once the trustee serves a formal notice, you have 120 days from the day it was mailed to ' +
    'file a trust contest. If you ask for a copy of the trust and it is delivered inside those ' +
    '120 days, you get 60 days from delivery if that is later.',
  whyItMatters:
    'Miss this date and the court will almost always refuse to hear your trust contest, no ' +
    'matter how strong it is.',
  applies: involvesTrust,
  clocks: trustClocks,
  notStarted: trustNotStarted,
  caveats: trustCaveats,
};

// ── Will contest ──────────────────────────────────────────────────────────

const probateStart = (a: WizardAnswers) =>
  a.probateStatus === 'admitted' ? validDate(a.probateDate) : undefined;

function willNotStarted(a: WizardAnswers): string {
  const lead = a.instrument === 'not-sure' ? 'If there is a will: ' : '';
  switch (a.probateStatus) {
    case 'admitted':
      return `${lead}Tell us the date of the order admitting the will and we will estimate this deadline.`;
    case 'filed':
      return (
        `${lead}The will has been filed but no judge has admitted it yet. You can object before ` +
        'that happens by filing a written objection at or before the hearing (Probate Code ' +
        '§ 8250). Find the hearing date on the petition and call a lawyer before it. Once the ' +
        'will is admitted, you have 120 days from the order.'
      );
    case 'not-filed':
      return (
        `${lead}No one has filed the will with the court, so the 120-day clock has not started. ` +
        'It starts the day a judge admits the will, and you can object before that. Do not wait ' +
        'for it: gather your documents and talk to a lawyer now.'
      );
    default:
      return (
        `${lead}Search the probate case index at the Santa Clara County Superior Court (or the ` +
        'court where the person lived) for a case in their name. If a judge has already admitted ' +
        'the will, the 120-day clock is running from the date of that order.'
      );
  }
}

export const WILL_CONTEST_RULE: DeadlineRule = {
  id: 'will-contest',
  label: 'Contest the will',
  statute: 'Probate Code § 8270',
  statuteUrl: statuteUrl('PROB', '8270'),
  description:
    'After a judge admits a will to probate, you have 120 days from the date of that order to ' +
    'ask the court to revoke it. Before the order, you can object at or before the hearing ' +
    '(Probate Code § 8250).',
  whyItMatters: 'After 120 days the will stands, and the estate is divided the way it says.',
  applies: involvesWill,
  clocks: [
    {
      from: 'the date of the order admitting the will',
      period: ONE_TWENTY_DAYS,
      start: probateStart,
    },
  ],
  notStarted: willNotStarted,
  caveats: () => [
    'This 120-day rule is for people who did not take part in a contest before the will was ' +
      'admitted and had no notice of one in time to join it.',
    'A person who was a minor, or who lacked capacity and had no guardian or conservator when ' +
      'the will was admitted, may have until final distribution.',
  ],
};
