import type { FollowUpAnswer, FollowUpModule, IntakeFile } from './contract';
import { FOLLOW_UP_REVIEW, VALUE_RANGE_LABELS } from './copy';

/**
 * The follow-up answers as the review screen reads them back, so nobody sends
 * an answer they cannot see. Pure: the state and the files go in, plain English
 * comes out.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * "2026-03-02" reads as "March 2, 2026". Built from the parts of the string
 * itself: `new Date('2026-03-02')` is midnight UTC, which is the day before in
 * California, and every date here is a calendar day with no time zone at all.
 */
export function longDate(iso: string): string | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!parts) return null;
  const [, year, month, day] = parts;
  const name = MONTHS[Number(month) - 1];
  if (!name || Number(day) < 1 || Number(day) > 31) return null;
  return `${name} ${Number(day)}, ${Number(year)}`;
}

function isValueRange(value: string): value is keyof typeof VALUE_RANGE_LABELS {
  return value in VALUE_RANGE_LABELS;
}

/** The files sent to an upload question, counted from the slot that carries its id. */
function uploadText(moduleId: string, files: readonly IntakeFile[]): string {
  const sent = files.filter((file) => file.slot === moduleId).length;
  return sent > 0 ? FOLLOW_UP_REVIEW.filesSent(sent) : FOLLOW_UP_REVIEW.noFiles;
}

/** One answer in plain English; an unanswered question says so rather than going quiet. */
export function formatFollowUpAnswer(
  module: FollowUpModule,
  answer: FollowUpAnswer | undefined,
  files: readonly IntakeFile[],
): string {
  if (module.type === 'upload') return uploadText(module.id, files);
  if (answer === null) return FOLLOW_UP_REVIEW.skipped;
  if (answer === undefined) return FOLLOW_UP_REVIEW.unanswered;
  if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
  if (Array.isArray(answer))
    return answer.length > 0 ? answer.join(', ') : FOLLOW_UP_REVIEW.unanswered;
  const text = answer.trim();
  if (!text) return FOLLOW_UP_REVIEW.unanswered;
  if (module.type === 'date') return longDate(text) ?? text;
  if (module.type === 'money_range' && isValueRange(text)) return VALUE_RANGE_LABELS[text];
  return text;
}

/** Most questions already end in "?", and "trustee?: March 2" reads as a typo. */
function joiner(label: string): string {
  return /[?:]$/.test(label.trimEnd()) ? ' ' : ': ';
}

/** "<question>: <answer>" per question the evaluation asked, in the order it asked them. */
export function followUpLines(
  modules: readonly FollowUpModule[],
  answers: Record<string, FollowUpAnswer>,
  files: readonly IntakeFile[],
): string[] {
  const asked = modules.filter(
    (module): module is Exclude<FollowUpModule, { type: 'info' }> => module.type !== 'info',
  );
  return asked.map(
    (module) =>
      `${module.label}${joiner(module.label)}${formatFollowUpAnswer(module, answers[module.id], files)}`,
  );
}
