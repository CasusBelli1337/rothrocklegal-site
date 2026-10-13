'use client';

import { sentOnDate } from '@/lib/intake/add-state';
import { DOCUMENTS_SLOT } from '@/lib/intake/contract';
import { ADD_OPEN_COPY } from '@/lib/intake/copy';
import type { AdditionController } from '@/lib/intake/use-addition';
import type { SaveStatus } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { Field, TextArea, hintId } from '../FormFields';
import { UploadSlot } from '../UploadSlot';
import { AddBar, AddFrame } from './AddFrame';

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: ADD_OPEN_COPY.saving,
  saved: ADD_OPEN_COPY.saved,
  error: ADD_OPEN_COPY.saveFailed,
};

interface AddOpenProps {
  add: AdditionController;
  uploads: UploadBinding;
}

/**
 * The screen the emailed link opens: the request's number and the day it was
 * sent, one optional box, the consult flow's upload slot, and Send. The
 * earlier answers are never shown; what was sent stays as it was.
 */
export function AddOpen({ add, uploads }: AddOpenProps) {
  const { state } = add;
  const addition = state.addition;
  if (!addition) return null;
  const date = sentOnDate(addition.sentAt);
  const uploading = uploads.pending.filter((p) => p.status === 'uploading').length;
  return (
    <AddFrame
      title={ADD_OPEN_COPY.title(addition.reference)}
      lead={
        <>
          {date && <p>{ADD_OPEN_COPY.sentOn(date)}</p>}
          <p>{ADD_OPEN_COPY.lead}</p>
        </>
      }
      hasError={Boolean(state.error)}
      onSubmit={() => void add.send(uploading)}
      bar={
        <AddBar
          error={state.error}
          label={ADD_OPEN_COPY.send}
          busy={state.busy}
          status={SAVE_LABELS[add.saveStatus]}
          next={ADD_OPEN_COPY.next}
        />
      }
    >
      <Field id="add-note" label={ADD_OPEN_COPY.noteLabel} hint={ADD_OPEN_COPY.noteHint} optional>
        <TextArea
          id="add-note"
          value={state.note}
          onChange={add.setNote}
          rows={6}
          describedBy={`${hintId('add-note')} add-note-count`}
        />
      </Field>
      <p id="add-note-count" className="mt-1 text-meta text-ink-3 tabular">
        {ADD_OPEN_COPY.noteCount(state.note.length)}
      </p>
      <div className="mt-6">
        <UploadSlot slot={DOCUMENTS_SLOT} label={ADD_OPEN_COPY.filesLabel} uploads={uploads} />
      </div>
    </AddFrame>
  );
}
