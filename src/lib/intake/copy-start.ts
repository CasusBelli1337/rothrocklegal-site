import { secondaryCta } from '@/config/site';
import type { StartTile } from './state';

/**
 * The three start tiles' words, and the reply promise they share with the
 * done screen. Re-exported from copy.ts so the hygiene tests see it.
 */

export const REPLY_PROMISE = 'We strive to respond within one business day, by email.';
export const REMOTE_NOTE = 'We meet by video.';

/** How long the package link works; the intake module sets the same expiry. */
export const PACKAGE_LINK_DAYS = 14;

/**
 * The three start tiles in Arthur's order (2026-10-02): how this works and what
 * we ask for, what the person gets whether or not we take the case, then what
 * we do with what they send, followed by the statements to agree to.
 */
export const START_TILES: Record<StartTile, { title: string; button: string }> = {
  0: { title: 'How this works', button: 'Got it, next' },
  1: { title: 'What you get, whether or not we take your case', button: 'Next' },
  2: { title: 'What we do with what you send', button: 'Start' },
};

/** The first tile: the process and what we ask for, in three numbered lines. */
export const HOW_THIS_WORKS = [
  'Tell us what happened, in your own words. Type it or say it out loud.',
  'We ask a few questions and tell you which papers help. Our own tools shape the questions around your answers, so you are never asked what does not matter.',
  `A lawyer reads everything. ${REPLY_PROMISE} ${REMOTE_NOTE}`,
] as const;

/** Under the first tile's list: why the flow asks so much, in the person's own interest. */
export const WHY_UP_FRONT =
  'We ask for a lot up front because it saves your time and ours. The more we know now, the more useful our first reply can be.';

/** One thing the person leaves with; `link` closes the body with an inline link. */
export interface TakeAway {
  title: string;
  body: string;
  link?: { before: string; label: string; href: string; after: string };
}

/** The second tile: what the person gets at the end, whether or not we take the case. */
export const WHAT_YOU_GET: readonly TakeAway[] = [
  {
    title: 'Your file package.',
    body: `A summary memo of what you told us and the deadlines that may apply, with your documents organized and clearly named. We email you a link that works once, and you can download it for ${PACKAGE_LINK_DAYS} days. It is yours to keep or to hand to another lawyer.`,
  },
  {
    title: 'The deadlines that may apply.',
    body: 'Clocks may already be running. A trust contest, for example, can be due 120 days after the trustee mails notice. Your memo lists the deadlines that may apply to a situation like yours. If a date looks close, talk to a lawyer now.',
    // Same tab: the draft lives in localStorage, so Back (or the nav) returns to this tile.
    link: {
      before: 'You can also check a date with ',
      label: 'our deadline tool',
      href: secondaryCta.href,
      after: '.',
    },
  },
  {
    title: 'A straight answer.',
    body: 'We set up a video call, ask for one or two more things, or tell you plainly that this is not a case for us. You get a written fee estimate before any work starts.',
  },
];

/**
 * The third tile, above the statements: the conflict check, then what happens
 * to what was sent. The one AI line on the start tiles lives here.
 */
export const WHAT_WE_DO = [
  'We have to run a conflict check first. Every name you give us goes against our client list, and nobody here looks at your story or your documents until it clears. If there is a conflict, we tell you, and what you sent is deleted unread.',
  'It is kept confidential and used only to decide whether we can help. AI helps us organize it; a lawyer decides what it means.',
] as const;

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
