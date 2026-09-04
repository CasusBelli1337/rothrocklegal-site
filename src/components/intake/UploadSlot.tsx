'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import type { IntakeFile } from '@/lib/intake/contract';
import { ACCEPT_ATTRIBUTE, ACCEPTED_TYPES_LABEL, formatBytes } from '@/lib/intake/document-slots';
import type { PendingUpload, UploadBinding } from '@/lib/intake/use-uploads';
import { WhyWeAsk } from './WhyWeAsk';

const linkButton =
  'tap-link text-small font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-600';

function DropZone({
  slot,
  multiple,
  uploads,
}: {
  slot: string;
  multiple: boolean;
  uploads: UploadBinding;
}) {
  const [dragging, setDragging] = useState(false);
  const inputId = `upload-${slot}`;
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        uploads.add(slot, Array.from(event.dataTransfer.files));
      }}
      className={`mt-3 flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-5 text-center transition-colors ${
        dragging ? 'border-maroon-500 bg-sand' : 'border-line-strong bg-paper'
      }`}
    >
      <p className="hidden text-small text-ink-2 [@media(pointer:fine)]:block">
        Drag files here, or
      </p>
      <label
        htmlFor={inputId}
        className={`${buttonClass('secondary', 'sm')} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-maroon-500`}
      >
        {multiple ? 'Choose files' : 'Choose a file'}
        <input
          id={inputId}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) uploads.add(slot, Array.from(event.target.files));
            event.target.value = '';
          }}
        />
      </label>
      <p className="text-meta text-ink-3">{ACCEPTED_TYPES_LABEL}</p>
    </div>
  );
}

function PendingRow({ item, uploads }: { item: PendingUpload; uploads: UploadBinding }) {
  const failed = item.status === 'error';
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-small text-ink">{item.name}</span>
        <span className="text-meta text-ink-3 tabular">
          {failed ? 'Not sent' : `${item.progress}%`}
        </span>
        {failed && item.retryable && (
          <button type="button" className={linkButton} onClick={() => uploads.retry(item.localId)}>
            Try again
          </button>
        )}
        <button type="button" className={linkButton} onClick={() => uploads.cancel(item.localId)}>
          {failed ? 'Remove' : 'Cancel'}
        </button>
      </div>
      {failed ? (
        <p className="mt-1 text-small text-error">{item.error}</p>
      ) : (
        <div
          role="progressbar"
          aria-label={`Uploading ${item.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={item.progress}
          className="wizard-progress mt-2"
        >
          <div className="wizard-progress-bar" style={{ width: `${item.progress}%` }} />
        </div>
      )}
    </li>
  );
}

function FileRow({ file, uploads }: { file: IntakeFile; uploads: UploadBinding }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-3">
      <span className="min-w-0 flex-1 truncate text-small text-ink">{file.name}</span>
      <span className="text-meta text-success">Sent · {formatBytes(file.size)}</span>
      <button type="button" className={linkButton} onClick={() => uploads.remove(file.id)}>
        Remove
      </button>
    </li>
  );
}

export interface UploadSlotProps {
  slot: string;
  label: string;
  why?: string;
  multiple?: boolean;
  uploads: UploadBinding;
  /** Keep the heading for screen readers only (the screen already shows the question). */
  headingHidden?: boolean;
}

/** One upload slot: heading, why, drop zone, per-file progress, retry, remove. */
export function UploadSlot({
  slot,
  label,
  why,
  multiple = true,
  uploads,
  headingHidden,
}: UploadSlotProps) {
  const files = uploads.files.filter((f) => f.slot === slot);
  const pending = uploads.pending.filter((p) => p.slot === slot);
  const frame = headingHidden ? '' : 'border border-line bg-white p-4 sm:p-5';
  return (
    <section aria-label={label} className={frame}>
      <h3 className={headingHidden ? 'sr-only' : 'font-sans text-h4 text-ink'}>{label}</h3>
      {why && <WhyWeAsk className="mt-1">{why}</WhyWeAsk>}
      <DropZone slot={slot} multiple={multiple} uploads={uploads} />
      {(files.length > 0 || pending.length > 0) && (
        <ul className="mt-2 divide-y divide-line" aria-live="polite">
          {files.map((file) => (
            <FileRow key={file.id} file={file} uploads={uploads} />
          ))}
          {pending.map((item) => (
            <PendingRow key={item.localId} item={item} uploads={uploads} />
          ))}
        </ul>
      )}
    </section>
  );
}
