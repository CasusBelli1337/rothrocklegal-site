'use client';

import { useCallback, useRef, useState } from 'react';
import { VOICE_NOTE_SLOT } from '@/lib/intake/contract';
import { STORY_COPY } from '@/lib/intake/copy';
import { formatBytes } from '@/lib/intake/document-slots';
import { appendPhrase } from '@/lib/intake/speech';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { TextArea } from './FormFields';
import { MicButton } from './MicButton';
import { STEP_HEADING_ID, StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

const link = 'tap-link underline underline-offset-3 hover:text-maroon-700';

function VoiceNoteStatus({ uploads }: { uploads: UploadBinding }) {
  const file = uploads.files.find((f) => f.slot === VOICE_NOTE_SLOT);
  const pending = uploads.pending.find((p) => p.slot === VOICE_NOTE_SLOT);
  if (!file && !pending) return null;
  return (
    <p className="mt-3 text-small text-ink-3" aria-live="polite">
      {file && (
        <>
          Voice note saved ({formatBytes(file.size)}).{' '}
          <button type="button" className={link} onClick={() => uploads.remove(file.id)}>
            Remove
          </button>
        </>
      )}
      {pending && pending.status === 'error' && (
        <span className="text-error">
          Voice note failed: {pending.error}{' '}
          <button type="button" className={link} onClick={() => uploads.retry(pending.localId)}>
            Try again
          </button>
        </span>
      )}
      {pending && pending.status === 'uploading' && (
        <>Saving your voice note… {pending.progress}%</>
      )}
    </p>
  );
}

/** Step 2: the story, typed or spoken. One line of guidance, the box, the microphone. */
export function StepStory({ intake, uploads }: StepProps) {
  const { story } = intake.state.answers;
  const [interim, setInterim] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { patchAnswers, update } = intake;
  // A heard phrase lands in the story (which the person may edit) and in spokenText (which they cannot).
  const appendFinal = useCallback(
    (text: string) =>
      update((s) => ({
        ...s,
        answers: {
          ...s.answers,
          story: appendPhrase(s.answers.story, text),
          spokenText: appendPhrase(s.answers.spokenText ?? '', text),
        },
      })),
    [update],
  );
  const onVoiceNote = useCallback((file: File) => uploads.add(VOICE_NOTE_SLOT, [file]), [uploads]);

  return (
    <StepFrame intake={intake}>
      <label htmlFor="story" className="sr-only">
        {STORY_COPY.label}
      </label>
      <TextArea
        id="story"
        value={story}
        onChange={(value) => patchAnswers({ story: value })}
        rows={8}
        describedBy={STEP_HEADING_ID}
        textareaRef={textareaRef}
        placeholder={STORY_COPY.placeholder}
      />
      <p className="mt-2 min-h-5 text-small italic text-ink-3" aria-live="polite">
        {interim}
      </p>
      <MicButton onInterim={setInterim} onFinal={appendFinal} onVoiceNote={onVoiceNote} />
      <VoiceNoteStatus uploads={uploads} />
    </StepFrame>
  );
}
