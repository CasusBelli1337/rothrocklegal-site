'use client';

import { useCallback, useRef, useState } from 'react';
import { KEY_DATE_FIELDS, STORY_CHIPS } from '@/lib/intake/copy';
import { VOICE_NOTE_SLOT, formatBytes } from '@/lib/intake/document-slots';
import { appendPhrase } from '@/lib/intake/speech';
import type { KeyDateKey } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { CheckboxRow, Field, TextArea, TextInput, hintId } from './FormFields';
import { MicButton } from './MicButton';
import { StepFrame } from './StepFrame';
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

function KeyDates({ intake }: { intake: IntakeController }) {
  const { keyDates } = intake.state.answers;
  const { unsureDates } = intake.state;
  const setDate = (key: KeyDateKey, value: string) =>
    intake.patchAnswers({ keyDates: { [key]: value || undefined } });
  const setUnsure = (key: KeyDateKey, unsure: boolean) =>
    intake.update((s) => ({
      ...s,
      unsureDates: unsure
        ? [...s.unsureDates.filter((k) => k !== key), key]
        : s.unsureDates.filter((k) => k !== key),
      answers: unsure
        ? { ...s.answers, keyDates: { ...s.answers.keyDates, [key]: undefined } }
        : s.answers,
    }));
  return (
    <fieldset className="mt-8">
      <legend className="text-body font-semibold text-ink">Dates that matter</legend>
      <p className="mt-1 text-small text-ink-3">
        Fill in what you know. &ldquo;Not sure&rdquo; is a fine answer.
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {KEY_DATE_FIELDS.map(({ key, label }) => {
          const unsure = unsureDates.includes(key);
          return (
            <div key={key}>
              <Field id={`date-${key}`} label={label}>
                <TextInput
                  id={`date-${key}`}
                  type="date"
                  value={keyDates[key] ?? ''}
                  onChange={(value) => setDate(key, value)}
                  disabled={unsure}
                />
              </Field>
              <CheckboxRow
                id={`unsure-${key}`}
                checked={unsure}
                onChange={(checked) => setUnsure(key, checked)}
              >
                Not sure
              </CheckboxRow>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Step 4: the story (typed or spoken), helper chips, and the key dates. */
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
  const addChip = (chip: string) => {
    const base = story.replace(/\s+$/, '');
    patchAnswers({ story: base ? `${base}\n\n${chip} ` : `${chip} ` });
    textareaRef.current?.focus();
  };

  return (
    <StepFrame intake={intake}>
      <Field
        id="story"
        label="What happened?"
        hint="Who died, when, what changed, and who did what. Names and dates help most."
      >
        <TextArea
          id="story"
          value={story}
          onChange={(value) => patchAnswers({ story: value })}
          rows={9}
          describedBy={hintId('story')}
          textareaRef={textareaRef}
          placeholder="Start anywhere. For example: My mother died in March. My brother was her caregiver, and now he says the trust leaves him the house."
        />
      </Field>
      <p className="mt-2 min-h-5 text-small italic text-ink-3" aria-live="polite">
        {interim}
      </p>
      <MicButton onInterim={setInterim} onFinal={appendFinal} onVoiceNote={onVoiceNote} />
      <VoiceNoteStatus uploads={uploads} />
      <div className="mt-6">
        <p className="text-small font-medium text-ink">
          Not sure what to say? Add a question and answer it.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STORY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => addChip(chip)}
              className="min-h-11 border border-line-strong bg-white px-4 text-small text-ink transition-colors hover:border-maroon-500 hover:bg-sand"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
      <KeyDates intake={intake} />
    </StepFrame>
  );
}
