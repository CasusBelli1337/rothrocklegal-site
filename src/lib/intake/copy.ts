import type { FundingOption, Party, Relationship, ValueRange } from './contract';
import type { KeyDateKey, StepId } from './state';

/**
 * Every line of copy in the intake flow lives here (config over code; plain
 * English for a worried family member, never legal advice, no em dashes).
 */

/** Start-screen boxes the client must tick, verbatim from INTAKE-SPEC §2 step 0. */
export const ACKNOWLEDGMENTS = [
  'Sending this does not make you a client and does not create an attorney-client relationship until both sides sign an engagement letter.',
  'We run a conflict check before we can discuss your matter, so we may have to decline without explaining why.',
  "Do not send us documents that belong to another lawyer's client file or that you were told you may not share.",
] as const;

export const CONFIDENTIALITY_NOTE =
  'What you send is kept confidential and used only to evaluate whether we can help. AI helps us organize what you send; a lawyer reviews everything before we reply.';

export const REPLY_PROMISE = 'We strive to respond within one business day, by email.';
export const REMOTE_NOTE = 'We meet by video, and in person by appointment when it helps.';

export const HOW_IT_WORKS = [
  'Tell us what happened, in your own words or out loud.',
  'Upload what you have. We tell you which papers help for your situation.',
  'We read it and may ask a few follow-up questions.',
  REPLY_PROMISE,
] as const;

export const CONFLICT_WHY =
  'We check every name against our client list before we can talk. That protects you.';
export const CONFLICT_CAVEAT =
  'We check every name you gave us against our client list. If there is a conflict, we may have to decline without saying why.';
export const FEE_ESTIMATE_NOTE = 'We give you a written fee estimate before any work starts.';
export const EVALUATION_UNAVAILABLE = 'We are reviewing what you sent and will follow up by email.';

/** "What happens after you send this", shown under the wizard on /request-a-consult/. */
export const AFTER_YOU_SEND: readonly { title: string; body: string }[] = [
  {
    title: 'We run a conflict check.',
    body: 'Every name you gave us goes against our client list first. If there is a conflict, we tell you we cannot help, without saying why.',
  },
  {
    title: 'A lawyer reads everything.',
    body: 'Your story, your dates, and your documents. AI helps us organize it; a lawyer decides what it means.',
  },
  {
    title: 'We email you.',
    body: `${REPLY_PROMISE} We set up a video call, ask for one or two more things, or tell you plainly that this is not a case for us.`,
  },
  {
    title: 'You get a written fee estimate before any work starts.',
    body: 'On the call we tell you what it would take and what it would cost. No pitch, no surprise bills.',
  },
];

export const STORY_CHIPS = [
  'When did they pass?',
  'Did you get a letter from the trustee?',
  'Who has the documents?',
  'What do you want to happen?',
] as const;

export const COUNTIES = [
  'Santa Clara County',
  'San Mateo County',
  'Alameda County',
  'San Francisco County',
  'Contra Costa County',
  'Marin County',
  'Santa Cruz County',
  'Monterey County',
  'San Benito County',
  'Sonoma County',
  'Napa County',
  'Solano County',
  'Another California county',
  'Outside California',
] as const;

export const RELATIONSHIP_OPTIONS: readonly { value: Relationship; label: string }[] = [
  { value: 'child', label: 'Their child' },
  { value: 'spouse', label: 'Their spouse' },
  { value: 'sibling', label: 'Their sibling' },
  { value: 'grandchild', label: 'Their grandchild' },
  { value: 'other-relative', label: 'Another relative' },
  { value: 'beneficiary', label: 'A beneficiary, not family' },
  { value: 'trustee-or-executor', label: 'The trustee or executor' },
  { value: 'friend-or-caregiver', label: 'A friend or caregiver' },
  { value: 'other', label: 'Something else' },
];

export const PARTY_ROLE_OPTIONS: readonly { value: Party['role']; label: string }[] = [
  { value: 'decedent', label: 'The person who died' },
  { value: 'trustee', label: 'Trustee' },
  { value: 'executor', label: 'Executor' },
  { value: 'beneficiary', label: 'Beneficiary' },
  { value: 'family', label: 'Family member' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'lawyer', label: 'Their lawyer' },
  { value: 'other', label: 'Other' },
];

export const VALUE_RANGE_LABELS: Record<ValueRange, string> = {
  'under-100k': 'Under $100,000',
  '100k-500k': '$100,000 to $500,000',
  '500k-1m': '$500,000 to $1 million',
  '1m-5m': '$1 million to $5 million',
  'over-5m': 'Over $5 million',
  unsure: 'Not sure',
};

export const FUNDING_LABELS: Record<FundingOption, string> = {
  hourly: 'I can pay hourly fees',
  'need-alternatives': 'I need another way to pay',
  unsure: 'Not sure yet',
};

export const KEY_DATE_FIELDS: readonly { key: KeyDateKey; label: string }[] = [
  { key: 'dateOfDeath', label: 'When did they pass away?' },
  { key: 'noticeReceived', label: 'When did you get a letter from the trustee?' },
  { key: 'trustCopyReceived', label: 'When did you get a copy of the trust?' },
  { key: 'willAdmitted', label: 'When did the court admit the will?' },
  { key: 'otherDeadline', label: 'Any other date you were told matters?' },
];

export const STEP_TITLES: Record<StepId, { title: string; lead?: string }> = {
  start: {
    title: 'Before we start',
    lead: 'Four things happen after you send this. Then three boxes to tick.',
  },
  contact: {
    title: 'How do we reach you?',
    lead: 'We reply by email unless you tell us otherwise.',
  },
  situations: {
    title: 'What is going on?',
    lead: 'Pick everything that fits. You can choose more than one.',
  },
  parties: {
    title: 'Who is involved?',
    lead: 'Names only for now. We ask so we can run a conflict check.',
  },
  story: {
    title: 'Tell us what happened',
    lead: 'Type it or say it out loud. Do not worry about the order or the legal words.',
  },
  documents: {
    title: 'What do you have?',
    lead: 'Send what you can find. Missing papers are normal. Tell us and we will ask for them later if we need to.',
  },
  scope: {
    title: 'Scope and cost',
    lead: 'Rough answers are fine. This helps us tell you early whether a case makes sense.',
  },
  review: {
    title: 'Check what you are sending',
    lead: 'Fix anything that looks wrong. Then send it for review.',
  },
  'follow-up': { title: 'A few more things' },
  done: { title: 'Thank you. We have it.' },
};
