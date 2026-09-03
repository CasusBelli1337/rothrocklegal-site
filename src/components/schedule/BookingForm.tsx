'use client';

import { Field, TextArea, TextInput } from '@/components/intake/FormFields';
import { Button } from '@/components/ui/Button';
import { SCHEDULE_COPY } from '@/lib/public/copy';
import type { BookingForm as BookingFormValues } from '@/lib/public/schedule-state';

interface BookingFormProps {
  form: BookingFormValues;
  onChange(patch: Partial<BookingFormValues>): void;
  /** "Tuesday, September 9 at 2:00 PM". */
  pickedLabel: string;
  onChangeSlot(): void;
  busy: boolean;
  error: string | null;
  onSubmit(): void;
}

/** The short form under the chosen time: name, email, phone, a note, and "Book this time". */
export function BookingForm({ form, onChange, pickedLabel, onChangeSlot, busy, error, onSubmit }: BookingFormProps) {
  const copy = SCHEDULE_COPY.form;
  return (
    <form
      noValidate
      aria-labelledby="booking-heading"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="wizard-enter mt-8 rounded-xl border border-line bg-white p-5 sm:p-8"
    >
      <div className="wizard-banner flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body text-ink">{SCHEDULE_COPY.picked(pickedLabel)}</p>
        <button
          type="button"
          onClick={onChangeSlot}
          className="tap-link self-start text-small font-medium text-ink underline underline-offset-3 hover:text-maroon-700"
        >
          {SCHEDULE_COPY.change}
        </button>
      </div>
      <h2 id="booking-heading" className="mt-8 font-serif text-h3 text-ink">
        {copy.heading}
      </h2>
      <fieldset disabled={busy} className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field id="booking-name" label={copy.name}>
          <TextInput
            id="booking-name"
            value={form.name}
            onChange={(name) => onChange({ name })}
            autoComplete="name"
          />
        </Field>
        <Field id="booking-email" label={copy.email} hint={copy.emailHint}>
          <TextInput
            id="booking-email"
            type="email"
            value={form.email}
            onChange={(email) => onChange({ email })}
            autoComplete="email"
            describedBy="booking-email-hint"
          />
        </Field>
        <Field id="booking-phone" label={copy.phone} optional>
          <TextInput
            id="booking-phone"
            type="tel"
            value={form.phone}
            onChange={(phone) => onChange({ phone })}
            autoComplete="tel"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="booking-notes" label={copy.notes} hint={copy.notesHint} optional>
            <TextArea
              id="booking-notes"
              value={form.notes}
              onChange={(notes) => onChange({ notes })}
              rows={3}
              describedBy="booking-notes-hint"
            />
          </Field>
        </div>
      </fieldset>
      <p role="alert" aria-live="assertive" className="mt-5 min-h-6 text-small font-semibold text-error">
        {error}
      </p>
      <Button type="submit" loading={busy} className="public-primary w-full sm:w-auto">
        {copy.button}
      </Button>
    </form>
  );
}
