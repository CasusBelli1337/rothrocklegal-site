import { describe, expect, it } from 'vitest';
import type { IntakeFile } from './contract';
import { UPLOAD_COPY } from './copy';
import { uploadSummary } from './upload-summary';
import type { PendingUpload } from './use-uploads';

const sent = (id: string, slot = 'documents'): IntakeFile => ({
  id,
  slot,
  name: `${id}.pdf`,
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: 'now',
});
const pending = (id: string, status: PendingUpload['status'], slot = 'documents'): PendingUpload => ({
  localId: id,
  slot,
  name: `${id}.pdf`,
  size: 10,
  progress: 0,
  status,
  retryable: true,
  attempts: 1,
});

describe('uploadSummary', () => {
  it('counts sent, uploading, and failed for one slot and reads as "12 of 65 uploaded"', () => {
    const s = uploadSummary(
      [sent('a'), sent('b'), sent('voice', 'voice-note')],
      [pending('c', 'uploading'), pending('d', 'error'), pending('e', 'error'), pending('f', 'uploading', 'other')],
      'documents',
    );
    expect(s).toEqual({ sent: 2, uploading: 1, failed: 2, total: 5 });
    expect(UPLOAD_COPY.progress(s.sent, s.total)).toBe('2 of 5 uploaded');
    expect(UPLOAD_COPY.failedCount(s.failed)).toMatch(/^2 files could not be uploaded/);
    expect(UPLOAD_COPY.failedCount(1)).toMatch(/^1 file could not be uploaded/);
  });

  it('is empty when nothing was handed over', () => {
    expect(uploadSummary([], [], 'documents').total).toBe(0);
  });
});
