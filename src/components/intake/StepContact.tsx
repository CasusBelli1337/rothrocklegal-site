'use client';

import { useState } from 'react';
import { COUNTIES, LOOKUP_CARD } from '@/lib/intake/copy';
import { normalizeEmail } from '@/lib/intake/resume';
import { validateStep } from '@/lib/intake/state';
import { useLookup } from '@/lib/intake/use-lookup';
import { ChoiceCards } from './ChoiceCards';
import { Field, SelectInput, TextInput } from './FormFields';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

const COUNTY_OPTIONS = COUNTIES.map((county) => ({ value: county, label: county }));

const REPLY_OPTIONS = [
  { value: 'email', label: 'Email (we reply fastest this way)' },
  { value: 'phone', label: 'Phone call' },
] as const;

/** The same card whether or not a request exists; only the inbox learns which (see LOOKUP_CARD). */
function LookupCard({ onDismiss }: { onDismiss(): void }) {
  return (
    <div role="status" aria-live="polite" className="wizard-banner mt-4">
      <p className="text-body text-ink">{LOOKUP_CARD.body}</p>
      <p className="mt-2 text-small text-ink-3">{LOOKUP_CARD.spam}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 inline-flex h-11 items-center rounded-md border border-ink bg-white px-5 text-body font-semibold text-ink transition-colors hover:bg-sand"
      >
        {LOOKUP_CARD.startFresh}
      </button>
    </div>
  );
}

/** Step 1: name, email (with the "started before" check), phone, city and county, reply preference. */
export function StepContact({ intake }: StepProps) {
  const { contact } = intake.state.answers;
  const set = (patch: Partial<typeof contact>) => intake.patchAnswers({ contact: patch });
  const lookup = useLookup(intake.state.session);
  const [waiting, setWaiting] = useState(false);
  const showCard = lookup.phase === 'answered' && lookup.email === normalizeEmail(contact.email);

  // Continue waits for the lookup once per address, so the card is seen before the screen changes.
  const submit = async () => {
    const problem = validateStep('contact', intake.state);
    if (problem) {
      intake.setError(problem);
      return;
    }
    setWaiting(true);
    const pause = await lookup.check(contact.email);
    setWaiting(false);
    if (pause) return;
    void intake.next();
  };

  return (
    <StepFrame
      intake={intake}
      onSubmit={() => void submit()}
      footer={<StepNav intake={intake} busy={waiting || intake.busy} />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Your full name">
          <TextInput
            id="contact-name"
            value={contact.fullName}
            onChange={(fullName) => set({ fullName })}
            autoComplete="name"
          />
        </Field>
        <Field
          id="contact-email"
          label="Email"
          hint="We reply here. It is also how you can come back to this request from another device."
        >
          <TextInput
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(email) => set({ email })}
            onBlur={() => void lookup.check(contact.email)}
            autoComplete="email"
            describedBy="contact-email-hint"
          />
        </Field>
      </div>
      {showCard && <LookupCard onDismiss={lookup.dismiss} />}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field id="contact-phone" label="Phone" optional>
          <TextInput
            id="contact-phone"
            type="tel"
            value={contact.phone ?? ''}
            onChange={(phone) => set({ phone: phone || undefined })}
            autoComplete="tel"
          />
        </Field>
        <Field id="contact-city" label="City" optional>
          <TextInput
            id="contact-city"
            value={contact.city ?? ''}
            onChange={(city) => set({ city: city || undefined })}
            autoComplete="address-level2"
          />
        </Field>
        <Field
          id="contact-county"
          label="County"
          optional
          hint="Where the person lived, if you know it."
        >
          <SelectInput
            id="contact-county"
            value={(contact.county as (typeof COUNTIES)[number] | undefined) ?? ''}
            onChange={(county) => set({ county: county || undefined })}
            options={COUNTY_OPTIONS}
            placeholder="Choose a county"
            describedBy="contact-county-hint"
          />
        </Field>
      </div>
      <div className="mt-6">
        <ChoiceCards
          name="contact-reply"
          legend="How should we reply?"
          options={REPLY_OPTIONS}
          value={contact.replyBy}
          onChange={(replyBy) => set({ replyBy })}
          columns={2}
        />
      </div>
    </StepFrame>
  );
}
