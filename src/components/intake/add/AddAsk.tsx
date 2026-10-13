'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ADD_ASK_COPY } from '@/lib/intake/copy';
import type { AdditionController } from '@/lib/intake/use-addition';
import { Field, TextInput, hintId } from '../FormFields';
import { AddBar, AddFrame } from './AddFrame';

const linkClass =
  'tap-link text-body font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-600';

/** The same card whatever the server found: only the inbox learns whether a request exists. */
function SentCard({ add }: { add: AdditionController }) {
  return (
    <div role="status" aria-live="polite" className="wizard-banner">
      <p className="text-body font-semibold text-ink">{ADD_ASK_COPY.cardTitle}</p>
      <p className="mt-2 text-body text-ink">{ADD_ASK_COPY.cardBody}</p>
      <p className="mt-2 text-small text-ink-3">{ADD_ASK_COPY.cardSpam}</p>
      <p className="mt-2 text-small text-ink-3">{ADD_ASK_COPY.cardNothing}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={add.startAgain}
          className="inline-flex h-11 items-center border border-ink bg-white px-5 text-body font-semibold text-ink transition-colors hover:bg-sand"
        >
          {ADD_ASK_COPY.otherEmail}
        </button>
        <Link href="/request-a-consult/" className={linkClass}>
          {ADD_ASK_COPY.startNew}
        </Link>
      </div>
    </div>
  );
}

/** Step one: the email address the request was sent from; the link goes to that inbox. */
export function AddAsk({ add }: { add: AdditionController }) {
  const { state } = add;
  const [email, setEmail] = useState('');
  if (state.phase === 'asked') {
    return (
      <AddFrame title={ADD_ASK_COPY.title} lead={ADD_ASK_COPY.lead}>
        <SentCard add={add} />
      </AddFrame>
    );
  }
  return (
    <AddFrame
      title={ADD_ASK_COPY.title}
      lead={ADD_ASK_COPY.lead}
      hasError={Boolean(state.error)}
      onSubmit={() => void add.ask(email)}
      bar={<AddBar error={state.error} label={ADD_ASK_COPY.button} busy={state.busy} />}
    >
      {state.expired && (
        <div role="alert" className="wizard-alert mb-5">
          <p className="text-body text-ink">{ADD_ASK_COPY.expired}</p>
        </div>
      )}
      <div className="max-w-[30rem]">
        <Field id="add-email" label={ADD_ASK_COPY.emailLabel} hint={ADD_ASK_COPY.emailHint}>
          <TextInput
            id="add-email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (state.error) add.dispatch({ type: 'error', message: null });
            }}
            autoComplete="email"
            describedBy={hintId('add-email')}
          />
        </Field>
      </div>
    </AddFrame>
  );
}
