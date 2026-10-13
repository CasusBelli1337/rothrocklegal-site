import { ADDITION_PAGE_PATH, ADDITION_RULES } from './contract';
import { REPLY_PROMISE } from './copy-start';

/**
 * Every word on /request-a-consult/add/ ("Add to your request", Arthur
 * 2026-10-13), plus the one line that points there from the consult flow.
 * Re-exported by copy.ts, so copy.test.ts holds it to the voice guide: plain
 * English, short sentences, no em dash, no outcome promise.
 */

const WINDOW = `${ADDITION_RULES.windowDays} days`;

/** The email screen, and the card after it: the same words whether or not a request exists. */
export const ADD_ASK_COPY = {
  title: 'Find your request',
  lead: 'Already sent us a request? You can send more documents or a note. We never change what you sent before. Enter the email address you used, and we will email you a link.',
  emailLabel: 'The email address you used for your request',
  emailHint: 'We email a link there, so we know it is you.',
  button: 'Email me a link',
  invalidEmail: 'Enter the email address you used for your request.',
  expired:
    'That link has expired or was already used. Enter your email address and we will send a new one.',
  cardTitle: 'Check your email',
  cardBody:
    'If we have a request from that address that can still be added to, a link is on its way. It works once, for 24 hours.',
  cardSpam: 'If it does not arrive in a few minutes, check your spam or junk folder.',
  cardNothing: `Still nothing? A request can be added to for ${WINDOW} after it is sent. You can always start a new request.`,
  startNew: 'Start a new request',
  otherEmail: 'Use a different email address',
} as const;

/** While the emailed link is being opened, or a refreshed page is being restored. */
export const ADD_WAIT_COPY = {
  opening: 'One moment. We are opening your request…',
  restoring: 'One moment. We are picking up where you left off…',
  retry: 'Try again',
} as const;

/** When the request cannot take more (declined, too old) or the person has added a lot lately. */
export const ADD_CLOSED_COPY = {
  closedTitle: 'This request can no longer be added to',
  closedBody: `A request can be added to for ${WINDOW} after it is sent. You can start a new request instead and mention the earlier one in your story.`,
  limitTitle: 'Please wait before adding more',
  limitFallback: `You can add to a request ${ADDITION_RULES.perRequest} times in ${ADDITION_RULES.perDays} days. Please try again later.`,
} as const;

/** The screen the emailed link opens. The person's earlier answers are never shown here. */
export const ADD_OPEN_COPY = {
  title: (reference: string): string => `Add to your request ${reference}`,
  sentOn: (date: string): string => `You sent it on ${date}.`,
  lead: 'What you sent stays as it was. Anything you add here goes with it.',
  noteLabel: 'What would you like to add?',
  noteHint: 'Something you remembered, a date, a name, or what a document is.',
  noteCount: (used: number): string =>
    `${used.toLocaleString('en-US')} of ${ADDITION_RULES.maxNoteChars.toLocaleString('en-US')} characters`,
  filesLabel: 'Documents to add',
  needSomething: 'Add a note or a file first.',
  send: 'Send',
  sending: 'Sending',
  next: 'Next: we add it to your request and tell the lawyers.',
  saving: 'Saving…',
  saved: 'Saved',
  saveFailed: 'Could not save your note. We will try again when you send.',
} as const;

/** The done screen. */
export const ADD_DONE_COPY = {
  title: 'Added to your request',
  /** What was added, in one sentence: the note, the documents, or both. */
  body: (reference: string, files: number, withNote: boolean): string => {
    const docs = files === 1 ? '1 document' : `${files} documents`;
    if (files === 0) return `We added your note to request ${reference}.`;
    return withNote
      ? `We added your note and ${docs} to request ${reference}.`
      : `We added ${docs} to request ${reference}.`;
  },
  next: [
    'We check any new names against our client list first.',
    'A lawyer reads what you added.',
    REPLY_PROMISE,
  ],
  again: 'Add something else',
} as const;

/** The pointers to the add page: the consult flow's done screen and the line under the consult panel. */
export const ADD_LATER_COPY = {
  doneLead: 'If you think of something later, you can add to your request at',
  doneLink: `rothrocklegal.com${ADDITION_PAGE_PATH}`,
  consultLead: 'Already sent us a request?',
  consultLink: 'You can add to it.',
} as const;
