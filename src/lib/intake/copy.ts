import type { FundingOption, Party, Relationship, ValueRange } from './contract';
import type { KeyDateKey, StepId } from './state';

export * from './copy-mic';

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

/** One plain sentence under each box, so nobody ticks something they do not follow. */
export const ACKNOWLEDGMENT_NOTES = [
  'In plain words: telling us what happened does not make us your lawyers yet, and we are not watching your deadlines until we agree in writing to take your case.',
  'In plain words: if we already represent someone on the other side, we cannot help you, and the rules stop us from saying who.',
  'In plain words: if a lawyer gave papers to someone else and they were meant to stay private, please do not send those to us.',
] as const;

export const NOT_YOUR_LAWYERS_YET =
  'Nothing here makes us your lawyers yet; an engagement letter does that later.';

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
    body: 'We tell you what it would take and what it would cost before any work starts.',
  },
];

/**
 * Under the email field once the server has been asked about the address. The
 * same words whether or not a request exists: a page that confirmed one would
 * tell anyone who typed a relative's address that they contacted a
 * trust-litigation firm. Only the inbox learns the answer.
 */
export const LOOKUP_CARD = {
  body: 'If we already have a request under this email address, we just sent that inbox a link to continue it. If not, just keep going.',
  spam: 'If the email does not arrive in a minute or two, check your spam or junk folder.',
  startFresh: 'Keep going',
} as const;

/** Above the steps when the page opened from an emailed continue link. */
export const RESUME_COPY = {
  loading: 'One moment. We are finding your earlier request…',
  restored:
    'Welcome back. We picked up where you left off. Everything you entered before is still here.',
  failed: 'That link has expired or was already used. You can start a new request below.',
} as const;

export const STORY_CHIPS = [
  'When did they pass?',
  'Did you get a letter from the trustee?',
  'Who has the documents?',
  'What do you want to happen?',
] as const;

/** The documents step: how to add papers on each kind of device, and what to leave out. */
export const DOCUMENTS_COPY = {
  phoneHint: 'Tap Choose files, then Take Photo or Photo Library. A photo of each page is fine.',
  desktopHint:
    'Click Choose files and pick the papers from your computer. Scans, photos, and PDFs all work.',
  missing: "I don't have this",
  nothingYet: 'Nothing to send yet? That is fine. Continue, and we will tell you what to look for.',
  doNotSendTitle: 'Please do not send',
  doNotSend: [
    "Another lawyer's files: anything from a lawyer's client file that was not addressed to you, or that you were told not to share.",
    "Someone else's private records, such as their medical or bank papers, unless you have a right to them (for example, as the trustee or executor).",
  ],
} as const;

export const REVIEW_NOTE =
  'You can change anything with the Edit links. Nothing is sent until you press Send for review.';

/** The three status lines the client watches while the server reads the intake (INTAKE-SPEC §2 step 7). */
export const EVALUATION_STAGES = [
  'Sending your documents…',
  'Reading what you sent…',
  'Checking for gaps…',
] as const;
/**
 * Measured 2026-09-03 on the deployed module: 41 s at Opus fast speed for a
 * text-only intake, against 124 s at standard speed earlier that day for a
 * three-page PDF, a photo, and a voice note. Uploads add time, so the copy
 * says "a minute or two" rather than the bare measurement.
 */
export const EVALUATION_WAIT = 'This usually takes a minute or two. Please keep this page open.';

export const FOLLOW_UP_COPY = {
  optional: '(optional)',
  helpsMost: '(optional, but it helps most)',
  intro:
    'Answer what you can. Every item here is optional; skip anything you do not have or do not know.',
  nothingMore: 'We have what we need for now. Send it, and we will take it from here.',
  skip: 'Skip for now',
  answer: 'Answer it',
  skipped: 'Skipped for now. We may ask again by email.',
} as const;

/** What happens next, on the done screen. Three short lines. */
export const DONE_NEXT = [
  'We run the conflict check first.',
  'A lawyer reads everything you sent.',
  REPLY_PROMISE,
] as const;

export const DONE_KEEP_REFERENCE =
  'Keep this reference number in case you need to write to us about this request. Until both sides sign an engagement letter, we are not your lawyers, so keep an eye on any dates you already know about.';

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
  'follow-up': {
    title: 'A few more things, all optional',
    lead: 'We read what you sent. Everything on this screen is optional: answer what you can, skip the rest, and press Send.',
  },
  done: { title: 'Thank you. We have it.' },
};

/** Under the Continue button: what the next screen asks for, so nothing is a surprise. */
export const NEXT_UP: Record<StepId, string> = {
  start: 'Next: how we can reach you.',
  contact: 'Next: what is going on, in a few taps.',
  situations: 'Next: the names of the people involved.',
  parties: 'Next: tell us what happened, in your own words.',
  story: 'Next: send any papers you have. None yet is fine.',
  documents: 'Next: a rough idea of what is at stake and how you would pay.',
  scope: 'Next: check everything before you send it.',
  review:
    'Next: we read what you sent, which takes a minute or two. Then we may ask a few optional questions.',
  'follow-up': 'Next: your reference number, and what happens after that.',
  done: '',
};

/** Rough minutes per screen, for the "about N minutes to go" line. */
export const STEP_MINUTES: Record<StepId, number> = {
  start: 1,
  contact: 1,
  situations: 1,
  parties: 1,
  story: 2,
  documents: 2,
  scope: 1,
  /** The screen itself plus the evaluation wait it announces ("a minute or two"). */
  review: 2,
  'follow-up': 1,
  done: 0,
};

/** "about 2 minutes to go" from this screen on (this one included). */
export function minutesToGo(step: StepId, order: readonly StepId[]): string {
  const from = order.indexOf(step);
  const total = order.slice(Math.max(from, 0)).reduce((sum, s) => sum + STEP_MINUTES[s], 0);
  if (total <= 1) return 'about a minute to go';
  return `about ${total} minutes to go`;
}
