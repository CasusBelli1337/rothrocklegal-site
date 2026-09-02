'use client';

import { MAX_FILES, VOICE_NOTE_SLOT, slotsForSituations } from '@/lib/intake/document-slots';
import { StepFrame } from './StepFrame';
import { UploadSlot } from './UploadSlot';
import type { StepProps } from './step-props';

/** Step 5: document slots for the chosen situations, each with a drop zone and "I don't have this". */
export function StepDocuments({ intake, uploads }: StepProps) {
  const { situations, missingDocuments } = intake.state.answers;
  const slots = slotsForSituations(situations);
  const sent = uploads.files.filter((f) => f.slot !== VOICE_NOTE_SLOT).length;
  const uploading = uploads.pending.some((p) => p.status === 'uploading');

  const setMissing = (key: string, checked: boolean) =>
    intake.patchAnswers({
      missingDocuments: checked
        ? [...missingDocuments.filter((k) => k !== key), key]
        : missingDocuments.filter((k) => k !== key),
    });

  const submit = () => {
    if (uploading) {
      intake.setError('Please wait for your files to finish uploading.');
      return;
    }
    void intake.next();
  };

  return (
    <StepFrame intake={intake} onSubmit={submit}>
      <p className="text-small text-ink-3 tabular" aria-live="polite">
        {sent} of {MAX_FILES} files sent.
      </p>
      <div className="mt-4 space-y-4">
        {slots.map((slot) => (
          <UploadSlot
            key={slot.key}
            slot={slot.key}
            label={slot.label}
            why={slot.why}
            uploads={uploads}
            missing={{
              checked: missingDocuments.includes(slot.key),
              onChange: (checked) => setMissing(slot.key, checked),
            }}
          />
        ))}
      </div>
      <p className="mt-6 text-small text-ink-3">
        Nothing to send yet? That is fine. Continue, and we will tell you what to look for.
      </p>
    </StepFrame>
  );
}
