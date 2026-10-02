// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DOCUMENTS_SLOT, VOICE_NOTE_SLOT, type IntakeFile } from '@/lib/intake/contract';
import { DOCUMENTS_COPY } from '@/lib/intake/copy';
import { emptyState } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { PendingUpload, UploadBinding } from '@/lib/intake/use-uploads';
import { StepDocuments } from './StepDocuments';

const intake = {
  state: { ...emptyState(), step: 'documents' as const },
  error: null,
  busy: false,
  saveStatus: 'idle',
  setError: vi.fn(),
  next: vi.fn(),
  back: vi.fn(),
  startOver: vi.fn(),
} as unknown as IntakeController;

const sent = (id: string, slot: string): IntakeFile => ({
  id,
  slot,
  name: `${id}.pdf`,
  size: 10,
  mimeType: 'application/pdf',
  uploadedAt: 'now',
});

const onItsWay: PendingUpload = {
  localId: 'p1',
  slot: DOCUMENTS_SLOT,
  name: 'big.pdf',
  size: 10,
  progress: 40,
  status: 'uploading',
  retryable: true,
  attempts: 1,
};

function renderWith(files: IntakeFile[], pending: PendingUpload[] = []) {
  const uploads = {
    files,
    pending,
    add: vi.fn(),
    retry: vi.fn(),
    cancel: vi.fn(),
    remove: vi.fn(),
  };
  render(<StepDocuments intake={intake} uploads={uploads as UploadBinding} />);
}

const nothingYet = () => screen.queryByText(DOCUMENTS_COPY.nothingYet);

afterEach(cleanup);

describe('StepDocuments "Nothing to send yet?"', () => {
  it('shows while the list is empty, even with a voice note sent elsewhere', () => {
    renderWith([sent('v', VOICE_NOTE_SLOT)]);
    expect(nothingYet()).toBeTruthy();
    expect(screen.getByText(DOCUMENTS_COPY.doNotSend)).toBeTruthy();
  });

  it('goes once a file is in the list (regression: it stayed after three uploads)', () => {
    renderWith([sent('a', DOCUMENTS_SLOT), sent('b', DOCUMENTS_SLOT), sent('c', DOCUMENTS_SLOT)]);
    expect(screen.getByText('3 of 3 uploaded')).toBeTruthy();
    expect(nothingYet()).toBeNull();
    expect(screen.getByText(DOCUMENTS_COPY.doNotSend)).toBeTruthy();
  });

  it('goes as soon as an upload starts', () => {
    renderWith([], [onItsWay]);
    expect(nothingYet()).toBeNull();
  });
});
