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
