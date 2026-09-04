import type { FollowUpAnswer, FollowUpModule, IntakeFile } from './contract';

/** Upload modules answer themselves with the ids of the files sent to their slot. */
export function withUploadAnswers(
  modules: readonly FollowUpModule[],
  answers: Record<string, FollowUpAnswer>,
  files: readonly IntakeFile[],
): Record<string, FollowUpAnswer> {
  const next = { ...answers };
  for (const item of modules) {
    if (item.type !== 'upload') continue;
    const ids = files.filter((f) => f.slot === item.id).map((f) => f.id);
    if (ids.length > 0) next[item.id] = ids;
  }
  return next;
}
