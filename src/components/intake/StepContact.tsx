'use client';

import { useState } from 'react';
import { CONTACT_COPY, LOOKUP_CARD } from '@/lib/intake/copy';
import { normalizeEmail } from '@/lib/intake/resume';
import { useLookup } from '@/lib/intake/use-lookup';
import { validateStep } from '@/lib/intake/validate';
import { ChoiceCards } from './ChoiceCards';
import { Field, TextInput, hintId } from './FormFields';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

/** The same card whether or not a request exists; only the inbox learns which (see LOOKUP_CARD). */
function LookupCard({ onDismiss }: { onDismiss(): void }) {
  return (
    <div role="status" aria-live="polite" className="wizard-banner mt-4">
      <p className="text-body text-ink">{LOOKUP_CARD.body}</p>
      <p className="mt-2 text-small text-ink-3">{LOOKUP_CARD.spam}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 inline-flex h-11 items-center border border-ink bg-white px-5 text-body font-semibold text-ink transition-colors hover:bg-sand"
      >
        {LOOKUP_CARD.startFresh}
      </button>
    </div>
  );
}

/** Step 1: name and email (with the "started before" check), then how to reply and a phone number. */
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" label="Your full name">
          <TextInput
            id="contact-name"
            value={contact.fullName}
            onChange={(fullName) => set({ fullName })}
            autoComplete="name"
          />
        </Field>
        <Field id="contact-email" label="Email" hint={CONTACT_COPY.emailHint}>
          <TextInput
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(email) => set({ email })}
            onBlur={() => void lookup.check(contact.email)}
            autoComplete="email"
            describedBy={hintId('contact-email')}
          />
        </Field>
      </div>
      {showCard && <LookupCard onDismiss={lookup.dismiss} />}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ChoiceCards
          name="contact-reply"
          legend={CONTACT_COPY.replyLegend}
          options={CONTACT_COPY.replyOptions}
          value={contact.replyBy}
          onChange={(replyBy) => set({ replyBy })}
          columns={2}
        />
        <Field id="contact-phone" label="Phone" optional>
          <TextInput
            id="contact-phone"
            type="tel"
            value={contact.phone ?? ''}
            onChange={(phone) => set({ phone: phone || undefined })}
            autoComplete="tel"
          />
        </Field>
      </div>
    </StepFrame>
  );
}
