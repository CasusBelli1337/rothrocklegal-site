/** The review screen's own words. Re-exported by `copy.ts`, like `copy-mic.ts`. */

/** The answers to the evaluation's questions, read back so nothing is sent unseen. */
export const FOLLOW_UP_REVIEW = {
  label: 'Your answers to our questions',
  skipped: 'Skipped for now',
  unanswered: 'Not answered',
  noFiles: 'No file sent',
  filesSent: (n: number): string => `${n} ${n === 1 ? 'file' : 'files'} sent`,
} as const;

export const REVIEW_NOTE = 'Nothing is sent until you press Send.';

/** Above the Send button: the package is the person's whatever happens next. */
export const REVIEW_PACKAGE_NOTE =
  'After you send, you can download a package of everything you gave us, with a plain summary of the deadlines that may apply.';
