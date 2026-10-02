/** The review screen's own words. Re-exported by `copy.ts`, like `copy-mic.ts`. */

/**
 * The answers to the evaluation's questions, read back so nothing is sent
 * unseen. An upload with no file reads "Skipped for now" or "Not answered"
 * like any other question (it read "No file sent" either way until 2026-10-02).
 */
export const FOLLOW_UP_REVIEW = {
  label: 'Your answers to our questions',
  skipped: 'Skipped for now',
  unanswered: 'Not answered',
  filesSent: (n: number): string => `${n} ${n === 1 ? 'file' : 'files'} sent`,
} as const;

export const REVIEW_NOTE = 'Nothing is sent until you press Send.';

/** Above the Send button: the package is the person's whatever happens next. */
export const REVIEW_PACKAGE_NOTE =
  'After you send, you can download a summary memo of what you told us, the deadlines that may apply, and your documents.';
