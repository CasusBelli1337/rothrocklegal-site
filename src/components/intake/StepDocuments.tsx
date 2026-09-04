'use client';

import { DOCUMENTS_SLOT, VOICE_NOTE_SLOT, type DocumentAsk } from '@/lib/intake/contract';
import { DOCUMENTS_COPY } from '@/lib/intake/copy';
import { MAX_FILES, slotsForSituations } from '@/lib/intake/document-slots';
import { StepFrame } from './StepFrame';
import { UploadSlot } from './UploadSlot';
import type { StepProps } from './step-props';

/** Step 4: guidance tailored to the story (or to the situations), then one drop zone for everything. */
export function StepDocuments({ intake, uploads }: StepProps) {
  const { storyRead, answers } = intake.state;
  const asks: readonly DocumentAsk[] = storyRead?.documents?.length
    ? storyRead.documents
    : slotsForSituations(answers.situations);
  const sent = uploads.files.filter((f) => f.slot !== VOICE_NOTE_SLOT).length;
  const uploading = uploads.pending.some((p) => p.status === 'uploading');

  const submit = () => {
    if (uploading) {
      intake.setError('Please wait for your files to finish uploading.');
      return;
    }
    void intake.next();
  };

  return (
    <StepFrame intake={intake} onSubmit={submit}>
      <h3 className="text-small font-semibold text-ink">{DOCUMENTS_COPY.guidanceTitle}</h3>
      <ul className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {asks.map((ask) => (
          <li key={ask.label} className="text-small leading-snug">
            <span className="font-medium text-ink">{ask.label}</span>{' '}
            <span className="text-meta text-ink-3">{ask.why}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <UploadSlot
          slot={DOCUMENTS_SLOT}
          label={DOCUMENTS_COPY.slotLabel}
          uploads={uploads}
          headingHidden
        />
      </div>
      <p className="mt-3 text-small text-ink-3 tabular" aria-live="polite">
        {sent} of {MAX_FILES} sent.
      </p>
      <p className="mt-3 text-small text-ink-2">{DOCUMENTS_COPY.nothingYet}</p>
      <p className="mt-1 text-small text-ink-3">{DOCUMENTS_COPY.doNotSend}</p>
    </StepFrame>
  );
}
