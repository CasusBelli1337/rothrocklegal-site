/**
 * Plain-text summary of the visitor's answers and results, used to prefill
 * the contact form so the firm sees the whole picture in one message.
 */
import { formatShortDate, isValidISODate } from './dates';
import type { DeadlineResult, WizardAnswers } from './types';

const INSTRUMENT_LABEL: Record<NonNullable<WizardAnswers['instrument']>, string> = {
  trust: 'Trust',
  will: 'Will',
  both: 'Trust and will',
  'not-sure': 'Not sure',
};

const TRUST_COPY_LABEL: Record<NonNullable<WizardAnswers['trustCopy']>, string> = {
  received: 'Yes',
  'not-asked': 'Have not asked',
  'asked-not-received': 'Asked, not received',
  'not-sure': 'Not sure',
};

const PROBATE_LABEL: Record<NonNullable<WizardAnswers['probateStatus']>, string> = {
  admitted: 'Yes',
  filed: 'Petition filed, no order yet',
  'not-filed': 'Not filed',
  'not-sure': 'Not sure',
};

const ACCOUNTING_LABEL: Record<NonNullable<WizardAnswers['accounting']>, string> = {
  received: 'Yes',
  'not-received': 'No',
  'not-sure': 'Not sure',
};

const CONCERN_LABEL: Record<NonNullable<WizardAnswers['concerns']>[number], string> = {
  'elder-abuse': 'Financial elder abuse',
  'broken-promise': 'Broken promise to leave me something',
  'trustee-accounting': 'Trustee mishandled the trust',
  'owed-money': 'Owed money by the estate',
};

const YES_NO_LABEL: Record<NonNullable<WizardAnswers['noticeServed']>, string> = {
  yes: 'Yes',
  no: 'No',
  'not-sure': 'Not sure',
};

function dated(label: string, date: string | undefined): string {
  return isValidISODate(date) ? `${label}, ${formatShortDate(date as string)}` : label;
}

function line(label: string, value: string | undefined): string | null {
  return value ? `${label}: ${value}` : null;
}

function answerLines(a: WizardAnswers): string[] {
  const concerns = (a.concerns ?? []).map((c) => CONCERN_LABEL[c]).join('; ');
  const lines = [
    line(
      'Date of death',
      isValidISODate(a.deathDate) ? formatShortDate(a.deathDate as string) : undefined,
    ),
    line('Estate plan', a.instrument && INSTRUMENT_LABEL[a.instrument]),
    line(
      'Trustee notice served',
      a.noticeServed && dated(YES_NO_LABEL[a.noticeServed], a.noticeDate),
    ),
    line(
      'Copy of trust received',
      a.trustCopy && dated(TRUST_COPY_LABEL[a.trustCopy], a.trustCopyDate),
    ),
    line(
      'Will admitted to probate',
      a.probateStatus && dated(PROBATE_LABEL[a.probateStatus], a.probateDate),
    ),
    line('Concerns', concerns || (a.concerns ? 'None of the listed concerns' : undefined)),
    line(
      'First learned of abuse',
      isValidISODate(a.abuseDiscoveryDate)
        ? formatShortDate(a.abuseDiscoveryDate as string)
        : undefined,
    ),
    line(
      'Trustee accounting received',
      a.accounting && dated(ACCOUNTING_LABEL[a.accounting], a.accountingDate),
    ),
    line(
      'First suspected a problem',
      isValidISODate(a.breachDiscoveryDate)
        ? formatShortDate(a.breachDiscoveryDate as string)
        : undefined,
    ),
    line(
      'Letters issued',
      isValidISODate(a.lettersDate) ? formatShortDate(a.lettersDate as string) : undefined,
    ),
    line(
      'Notice of Administration',
      isValidISODate(a.noticeOfAdministrationDate)
        ? formatShortDate(a.noticeOfAdministrationDate as string)
        : undefined,
    ),
  ];
  return lines.filter((l): l is string => l !== null);
}

export function describeStatus(result: DeadlineResult): string {
  const days = result.daysRemaining;
  switch (result.status) {
    case 'not-started':
      return 'clock not started';
    case 'passed':
      return days === -1 ? 'passed yesterday' : `passed ${Math.abs(days ?? 0)} days ago`;
    case 'urgent':
      return days === 0
        ? 'TODAY'
        : days === 1
          ? '1 day left (urgent)'
          : `${days} days left (urgent)`;
    default:
      return `${days} days left`;
  }
}

function resultLine(result: DeadlineResult): string {
  const date = result.deadline ? `${formatShortDate(result.deadline)}, ` : '';
  return `- ${result.label} (${result.statute}): ${date}${describeStatus(result)}`;
}

export function buildSummary(answers: WizardAnswers, results: readonly DeadlineResult[]): string {
  return [
    'Deadline check from rothrocklegal.com (estimates, not legal advice)',
    '',
    ...answerLines(answers),
    '',
    'Estimated deadlines:',
    ...results.map(resultLine),
    '',
    'I would like to talk to a lawyer about these deadlines.',
  ].join('\n');
}
