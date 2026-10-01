import type { StartTile } from './state';

/**
 * The three start tiles' words, and the reply promise they share with the
 * done screen. Re-exported from copy.ts so the hygiene tests see it.
 */

export const REPLY_PROMISE = 'We strive to respond within one business day, by email.';
export const REMOTE_NOTE = 'We meet by video, and in person by appointment.';

/** The three start tiles, one at a time; each carries its own button label. */
export const START_TILES: Record<StartTile, { title: string; button: string }> = {
  0: { title: 'Before we start', button: 'Got it, next' },
  1: { title: 'What happens after you send this', button: 'Next' },
  2: { title: 'Three things to read carefully', button: 'Start' },
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

/**
 * The third tile: the three statements to read (the second per the ethics memo,
 * 2026-09-03). Nobody is told to tick a box; a box is ticked only by someone
 * who read the statement and agreed with it (Arthur, 2026-09-04).
 */
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

export const ACKNOWLEDGMENTS_LEGEND =
  'Please read each statement carefully. If you understand it and agree, tick its box.';
