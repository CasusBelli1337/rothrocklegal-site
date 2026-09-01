/**
 * Wizard step config. One question per step; a step only appears when its
 * `applies` predicate is true for the answers so far. Copy is written for a
 * worried family member, not a lawyer.
 */
import type { Concern, DateAnswerKey, WizardAnswers } from '@/lib/deadlines/types';

export type ChoiceKey =
  | 'instrument'
  | 'noticeServed'
  | 'trustCopy'
  | 'probateStatus'
  | 'accounting';

export interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

export interface DateField {
  key: DateAnswerKey;
  label: string;
  help: string;
  required: boolean;
  /** Only shown when the step's choice is one of these values. */
  showFor?: readonly string[];
}

export interface WizardStep {
  id: string;
  kind: 'dates' | 'single' | 'multi';
  question: string;
  lead?: string;
  choiceKey?: ChoiceKey;
  options?: readonly ChoiceOption[];
  fields?: readonly DateField[];
  applies(answers: WizardAnswers): boolean;
}

const BEST_GUESS = "It's fine if you're not sure – give your best guess. You can change it later.";

const mayHaveTrust = (a: WizardAnswers) => a.instrument !== undefined && a.instrument !== 'will';
const mayHaveWill = (a: WizardAnswers) => a.instrument !== undefined && a.instrument !== 'trust';
const hasConcern = (a: WizardAnswers, c: Concern) => a.concerns?.includes(c) ?? false;

export const CONCERN_OPTIONS: readonly (ChoiceOption & { value: Concern })[] = [
  {
    value: 'elder-abuse',
    label: 'Someone took money or property from them while they were alive',
  },
  {
    value: 'broken-promise',
    label: "They promised to leave me something, and it didn't happen",
  },
  {
    value: 'trustee-accounting',
    label: 'I think the trustee is mishandling the trust',
  },
  { value: 'owed-money', label: 'They owed me money or property' },
];

export const WIZARD_STEPS: readonly WizardStep[] = [
  {
    id: 'death',
    kind: 'dates',
    question: 'When did the person pass away?',
    lead: 'Most deadlines count from this date.',
    fields: [
      {
        key: 'deathDate',
        label: 'Date of death',
        help: BEST_GUESS,
        required: true,
      },
    ],
    applies: () => true,
  },
  {
    id: 'instrument',
    kind: 'single',
    question: 'Did they leave a trust, a will, or both?',
    choiceKey: 'instrument',
    options: [
      {
        value: 'trust',
        label: 'A trust',
        hint: 'A living trust or family trust. A trustee is in charge of it.',
      },
      {
        value: 'will',
        label: 'A will',
        hint: 'A will goes through the probate court.',
      },
      {
        value: 'both',
        label: 'Both a trust and a will',
        hint: 'Very common. The trust usually holds most of the property.',
      },
      {
        value: 'not-sure',
        label: "I'm not sure",
        hint: "We'll show the deadlines for both.",
      },
    ],
    applies: () => true,
  },
  {
    id: 'notice',
    kind: 'single',
    question: 'Has the trustee sent you a formal notice about the trust?',
    lead:
      'After a death, the trustee must mail a letter called a "Notification by Trustee". ' +
      'It says you have 120 days to contest the trust.',
    choiceKey: 'noticeServed',
    options: [
      { value: 'yes', label: 'Yes, I received one' },
      { value: 'no', label: 'No, nothing like that' },
      {
        value: 'not-sure',
        label: "I'm not sure",
        hint: 'Check your mail. It can look like a form letter.',
      },
    ],
    fields: [
      {
        key: 'noticeDate',
        label: 'Date the notice was mailed',
        help:
          'Use the mailing date on the notice or its proof of service, not the day it arrived. ' +
          'Not sure? Use the earliest date it could have been mailed – that keeps you safe.',
        required: true,
        showFor: ['yes'],
      },
    ],
    applies: mayHaveTrust,
  },
  {
    id: 'trust-copy',
    kind: 'single',
    question: 'Did you ask the trustee for a copy of the trust, and did you get it?',
    lead: 'You have the right to a full copy. Asking in writing can add time to your deadline.',
    choiceKey: 'trustCopy',
    options: [
      { value: 'received', label: 'Yes, I have a copy' },
      { value: 'not-asked', label: "I haven't asked yet" },
      {
        value: 'asked-not-received',
        label: "I asked, but haven't received it",
      },
      { value: 'not-sure', label: "I'm not sure" },
    ],
    fields: [
      {
        key: 'trustCopyDate',
        label: 'Date the copy was delivered to you',
        help: 'If it came by mail, use the mailing date if you know it. Otherwise, the day it arrived.',
        required: true,
        showFor: ['received'],
      },
    ],
    applies: (a) => mayHaveTrust(a) && a.noticeServed === 'yes',
  },
  {
    id: 'probate',
    kind: 'single',
    question: 'Has a court admitted the will to probate?',
    lead: '"Admitted to probate" means a judge signed an order accepting the will. That order starts a 120-day clock.',
    choiceKey: 'probateStatus',
    options: [
      { value: 'admitted', label: 'Yes, a judge admitted it' },
      {
        value: 'filed',
        label: "A petition was filed, but there's no order yet",
      },
      { value: 'not-filed', label: 'No one has filed it with the court' },
      { value: 'not-sure', label: "I'm not sure" },
    ],
    fields: [
      {
        key: 'probateDate',
        label: 'Date of the order admitting the will',
        help: "It's on the court's order. Not sure? Give your best guess.",
        required: true,
        showFor: ['admitted'],
      },
    ],
    applies: mayHaveWill,
  },
  {
    id: 'concerns',
    kind: 'multi',
    question: 'Do any of these describe your situation?',
    lead: 'Pick all that apply, or none.',
    options: CONCERN_OPTIONS,
    applies: () => true,
  },
  {
    id: 'abuse',
    kind: 'dates',
    question: 'When did you first learn money or property was taken?',
    fields: [
      {
        key: 'abuseDiscoveryDate',
        label: 'Date you first learned about it',
        help: 'The day you found out, or first had good reason to suspect it. Your best guess is fine.',
        required: true,
      },
    ],
    applies: (a) => hasConcern(a, 'elder-abuse'),
  },
  {
    id: 'accounting',
    kind: 'single',
    question: 'Has the trustee given you a written accounting or report?',
    lead: 'An accounting lists what came in, what went out, and what is left.',
    choiceKey: 'accounting',
    options: [
      { value: 'received', label: 'Yes, I received one' },
      { value: 'not-received', label: 'No' },
      { value: 'not-sure', label: "I'm not sure" },
    ],
    fields: [
      {
        key: 'accountingDate',
        label: 'Date you received the accounting',
        help: BEST_GUESS,
        required: true,
        showFor: ['received'],
      },
      {
        key: 'breachDiscoveryDate',
        label: 'When did you first suspect a problem?',
        help: 'Your best guess is fine.',
        required: true,
        showFor: ['not-received', 'not-sure'],
      },
    ],
    applies: (a) => hasConcern(a, 'trustee-accounting'),
  },
  {
    id: 'estate',
    kind: 'dates',
    question: 'Where does the probate case stand?',
    lead: "Leave a date blank if it hasn't happened or you don't know.",
    fields: [
      {
        key: 'lettersDate',
        label: 'Date the court appointed the executor or administrator',
        help: 'The court calls this issuing "letters". The date is on the court\'s order.',
        required: false,
      },
      {
        key: 'noticeOfAdministrationDate',
        label: 'Date on the Notice of Administration you received',
        help: "Skip this if you didn't get one.",
        required: false,
      },
    ],
    applies: (a) => hasConcern(a, 'owed-money'),
  },
];
