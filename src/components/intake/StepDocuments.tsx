'use client';

import { DOCUMENTS_COPY } from '@/lib/intake/copy';
import { MAX_FILES, VOICE_NOTE_SLOT, slotsForSituations } from '@/lib/intake/document-slots';
import { useBrowser } from '@/lib/intake/use-browser';
import { StepFrame } from './StepFrame';
import { UploadSlot } from './UploadSlot';
import type { StepProps } from './step-props';

/** Step 5: document slots for the chosen situations, each with a drop zone and "I don't have this". */
export function StepDocuments({ intake, uploads }: StepProps) {
  const { situations, missingDocuments } = intake.state.answers;
  const slots = slotsForSituations(situations);
  const sent = uploads.files.filter((f) => f.slot !== VOICE_NOTE_SLOT).length;
  const uploading = uploads.pending.some((p) => p.status === 'uploading');
  const browser = useBrowser();
  const hint = browser.device === 'desktop' ? DOCUMENTS_COPY.desktopHint : DOCUMENTS_COPY.phoneHint;

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
      <p className="text-body text-ink">{hint}</p>
      <p className="mt-2 text-small text-ink-3 tabular" aria-live="polite">
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
      <p className="mt-6 text-small text-ink-3">{DOCUMENTS_COPY.nothingYet}</p>
      <section aria-labelledby="do-not-send" className="mt-6 border border-line bg-paper p-5">
        <h3 id="do-not-send" className="text-body font-semibold text-ink">
          {DOCUMENTS_COPY.doNotSendTitle}
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-small text-ink-2">
          {DOCUMENTS_COPY.doNotSend.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </StepFrame>
  );
}
