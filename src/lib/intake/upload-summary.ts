import type { IntakeFile } from './contract';
import type { PendingUpload } from './use-uploads';

/** The live count for one slot: what is sent, what is on its way, what failed. */
export interface UploadSummary {
  sent: number;
  uploading: number;
  failed: number;
  /** Everything the person handed us for this slot, sent or not. */
  total: number;
}

export function uploadSummary(
  files: readonly IntakeFile[],
  pending: readonly PendingUpload[],
  slot: string,
): UploadSummary {
  const sent = files.filter((f) => f.slot === slot).length;
  const mine = pending.filter((p) => p.slot === slot);
  const uploading = mine.filter((p) => p.status === 'uploading').length;
  const failed = mine.length - uploading;
  return { sent, uploading, failed, total: sent + mine.length };
}
