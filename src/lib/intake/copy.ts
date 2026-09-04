import type { FundingOption, Party, ValueRange } from './contract';
import type { StartTile, StepId } from './state';

export * from './copy-mic';

/**
 * Every line of copy in the intake flow lives here (config over code; plain
 * English for a worried family member, never legal advice, no em dashes).
 */

export const REPLY_PROMISE = 'We strive to respond within one business day, by email.';
export const REMOTE_NOTE = 'We meet by video, and in person by appointment.';

/** The three start tiles, one at a time; each carries its own button label. */
export const START_TILES: Record<StartTile, { title: string; button: string }> = {
  0: { title: 'Before we start', button: 'Got it, next' },
  1: { title: 'What happens after you send this', button: 'Next' },
  2: { title: 'Three boxes to tick', button: 'Start' },
};

/** The first tile: what this is, in three short lines. */
export const BEFORE_WE_START = [
  'Tell us what happened, in your own words. Type it or say it out loud.',
  'Upload what you have. We tell you which papers help.',
  `A lawyer reads it and we reply by email. ${REPLY_PROMISE} ${REMOTE_NOTE}`,
] as const;

export const CONFIDENTIALITY_NOTE =
  'What you send is kept confidential and used only to evaluate whether we can help. AI helps us organize what you send; a lawyer reviews everything before we reply.';

/** The second tile. */
export const AFTER_YOU_SEND: readonly { title: string; body: string }[] = [
  {
    title: 'We run a conflict check.',
    body: 'Every name in your request goes against our client list before a lawyer reads anything. If there is a conflict, we tell you we cannot help, and what you sent is deleted unread.',
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

/** The third tile: the boxes the client must tick (the second per the ethics memo, 2026-09-03). */
export const ACKNOWLEDGMENTS = [
  'Sending this does not make you a client and does not create an attorney-client relationship until both sides sign an engagement letter.',
  'We run an automated conflict check on the names in your submission before any lawyer reads it, and we may decline your matter for any reason. If a conflict is found, no lawyer will read your description or your documents; they are deleted, and only the names, the date, and the fact that we declined are kept in our conflicts records.',
  "Do not send us documents that belong to another lawyer's client file or that you were told you may not share.",
] as const;

/** Shown in brackets on the same label, so nobody ticks something they do not follow. */
export const ACKNOWLEDGMENT_NOTES = [
  'In plain words: telling us what happened does not make us your lawyers yet, and we are not watching your deadlines until we agree in writing to take your case.',
  'In plain words: a computer checks the names first. If we already represent someone on the other side, we cannot help you, nobody here reads what you wrote, and it is erased. Keep your own copies of anything you send.',
  'In plain words: if a lawyer gave papers to someone else and they were meant to stay private, please do not send those to us.',
] as const;

export const ACKNOWLEDGMENTS_LEGEND = 'Please tick all three boxes';

export const CONFLICT_WHY =
  'We check every name against our client list before we can talk. That protects you.';
export const CONFLICT_CAVEAT =
  'We check every name in your request against our client list before a lawyer reads it. If there is a conflict, we tell you we cannot help, without saying more, and what you sent is deleted unread.';
export const FEE_ESTIMATE_NOTE = 'We give you a written fee estimate before any work starts.';

/**
 * Under the email field once the server has been asked about the address. The
 * same words whether or not a request exists: a page that confirmed one would
 * tell anyone who typed a relative's address that they contacted a
 * trust-litigation firm. Only the inbox learns the answer.
 */
export const LOOKUP_CARD = {
  body: 'Started this before on another device? If a request already exists under this address, a link to continue it is on its way to that inbox. Otherwise, just keep going.',
  spam: 'If an email does not arrive in a minute or two, check your spam or junk folder.',
  startFresh: 'Keep going',
} as const;

/** Above the steps when the page opened from an emailed continue link. */
export const RESUME_COPY = {
  loading: 'One moment. We are finding your earlier request…',
  restored:
    'Welcome back. We picked up where you left off. Everything you entered before is still here.',
  failed: 'That link has expired or was already used. You can start a new request below.',
} as const;

export const CONTACT_COPY = {
  emailHint: 'We reply here. It is also how you come back to this request from another device.',
  replyLegend: 'How should we reply?',
  replyOptions: [
    { value: 'email', label: 'Email (fastest)' },
    { value: 'phone', label: 'Phone call' },
  ],
} as const;

export const STORY_COPY = {
  label: 'What happened',
  placeholder:
    'Start anywhere. For example: My mother died in March, and my brother says the trust now leaves him the house.',
} as const;

/** The reading state after the story, then the card that shows what the model understood. */
export const STORY_READ_COPY = {
  reading: 'Reading your story…',
  understoodTitle: 'Here is what we understood',
  confirm: 'Change anything that is wrong, then continue.',
  manual: 'Pick everything that fits. You can choose more than one.',
} as const;

/** The documents step: one drop zone with guidance above it. */
export const DOCUMENTS_COPY = {
  guidanceTitle: 'What helps most for your situation',
  slotLabel: 'Your documents',
  nothingYet: 'Nothing to send yet? That is fine. Continue anyway.',
  doNotSend:
    "Please do not send another lawyer's client file, or someone else's private records you have no right to.",
} as const;

/** The three status lines the client watches while the server reads the intake. */
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
export const EVALUATION_READING_TITLE = 'Reading what you sent';
export const EVALUATION_FALLBACK =
  'We could not finish reading what you sent just now. Add the people involved yourself; a lawyer reads everything after you send it.';

export const PARTIES_COPY = {
  found: 'Here is who we found in your story and documents. Fix anything that is wrong.',
  manual:
    'The person who died, the trustee or executor, other family, anyone on the other side, and their lawyer if you know the name.',
  add: 'Add someone',
  remove: 'Remove',
  noteLabel: 'Anything to add or correct?',
  noteHint: 'A name we missed, a wrong role, or how these people are related.',
} as const;

export const SCOPE_COPY = {
  valueLegend: 'Roughly how much is in dispute?',
  valueHint: 'The house, the accounts, the business. A guess is fine.',
  fundingLegend: 'How would you pay for a lawyer?',
  urgencyLabel: 'Is anything about to happen?',
  urgencyHint: 'A hearing, a sale, a letter with a date in it, or a deadline someone mentioned.',
  outcomeLabel: 'What do you want to happen?',
  outcomeHint: 'An accounting, the house back, a fair share, someone removed as trustee.',
} as const;

export const FOLLOW_UP_COPY = {
  optional: '(optional)',
  helpsMost: '(optional, but it helps most)',
  skip: 'Skip for now',
  answer: 'Answer it',
  skipped: 'Skipped for now. We may ask again by email.',
} as const;

export const REVIEW_NOTE = 'Nothing is sent until you press Send.';

/** What happens next, on the done screen. Three short lines. */
export const DONE_NEXT = [
  'We run the conflict check first.',
  'A lawyer reads everything you sent.',
  REPLY_PROMISE,
] as const;

export const DONE_KEEP_REFERENCE =
  'Keep this reference number in case you need to write to us about this request. Until both sides sign an engagement letter, we are not your lawyers, so keep an eye on any dates you already know about.';

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

export const STEP_TITLES: Record<StepId, { title: string; lead?: string }> = {
  start: { title: 'Before we start' },
  contact: {
    title: 'How do we reach you?',
    lead: 'We reply by email unless you tell us otherwise.',
  },
  story: {
    title: 'Tell us what happened',
    lead: 'In your own words: who, what, when, where, and how. Type it or tap the microphone.',
  },
  situations: { title: 'What is going on?' },
  documents: {
    title: 'Send what you have',
    lead: 'Photos of paper are fine. Missing papers are normal.',
  },
  parties: { title: 'Who is involved?' },
  scope: {
    title: 'Scope and cost',
    lead: 'Rough answers are fine. This helps us tell you early whether a case makes sense.',
  },
  'follow-up': {
    title: 'A few more things, all optional',
    lead: 'Answer what you can. Skip anything you do not have or do not know.',
  },
  review: { title: 'Check and send', lead: 'Fix anything that looks wrong. Then send it.' },
  done: { title: 'Thank you. We have it.' },
};

/** Beside the Continue button: what the next screen asks for, so nothing is a surprise. */
export const NEXT_UP: Record<StepId, string> = {
  start: 'Next: how we can reach you.',
  contact: 'Next: tell us what happened, in your own words.',
  story: 'Next: we read your story and show you what we understood.',
  situations: 'Next: send any papers you have. None yet is fine.',
  documents: 'Next: we read what you sent, then show you who is involved.',
  parties: 'Next: a rough idea of what is at stake and how you would pay.',
  scope: 'Next: check everything before you send it.',
  'follow-up': 'Next: check everything before you send it.',
  review: 'Next: your reference number, and what happens after that.',
  done: '',
};

/** Rough minutes per screen, for the "about N minutes to go" line. */
export const STEP_MINUTES: Record<StepId, number> = {
  start: 1,
  contact: 1,
  story: 2,
  situations: 1,
  /** Includes the evaluation wait the next screen announces ("a minute or two"). */
  documents: 3,
  parties: 1,
  scope: 1,
  'follow-up': 1,
  review: 1,
  done: 0,
};

/** "about 2 minutes to go" from this screen on (this one included). */
export function minutesToGo(step: StepId, order: readonly StepId[]): string {
  const from = order.indexOf(step);
  const total = order.slice(Math.max(from, 0)).reduce((sum, s) => sum + STEP_MINUTES[s], 0);
  if (total <= 1) return 'about a minute to go';
  return `about ${total} minutes to go`;
}
