'use client';

import { COUNTIES } from '@/lib/intake/copy';
import { ChoiceCards } from './ChoiceCards';
import { Field, SelectInput, TextInput } from './FormFields';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';

const COUNTY_OPTIONS = COUNTIES.map((county) => ({ value: county, label: county }));

const REPLY_OPTIONS = [
  { value: 'email', label: 'Email (we reply fastest this way)' },
  { value: 'phone', label: 'Phone call' },
] as const;

/** Step 1: name, email, phone, city and county, reply preference. */
export function StepContact({ intake }: StepProps) {
  const { contact } = intake.state.answers;
  const set = (patch: Partial<typeof contact>) => intake.patchAnswers({ contact: patch });

  return (
    <StepFrame intake={intake}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Your full name">
          <TextInput
            id="contact-name"
            value={contact.fullName}
            onChange={(fullName) => set({ fullName })}
            autoComplete="name"
          />
        </Field>
        <Field id="contact-email" label="Email">
          <TextInput
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(email) => set({ email })}
            autoComplete="email"
          />
        </Field>
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
