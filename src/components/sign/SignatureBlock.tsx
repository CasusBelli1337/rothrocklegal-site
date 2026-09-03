'use client';

import { CheckboxRow, Field, TextInput } from '@/components/intake/FormFields';
import { Button } from '@/components/ui/Button';
import type { SignatureKind } from '@/lib/public/contract';
import { SIGN_COPY } from '@/lib/public/copy';
import type { SignatureInput } from '@/lib/public/sign-state';
import { SignaturePad } from './SignaturePad';
import { signatureFont } from './signature-font';

interface SignatureBlockProps {
  input: SignatureInput;
  onChange(patch: Partial<SignatureInput>): void;
  readToEnd: boolean;
  busy: boolean;
  error: string | null;
  onSubmit(): void;
}

const METHODS: readonly { value: SignatureKind; label: string }[] = [
  { value: 'typed', label: SIGN_COPY.signature.typed },
  { value: 'drawn', label: SIGN_COPY.signature.drawn },
];

function MethodToggle({
  kind,
  onChange,
}: {
  kind: SignatureKind;
  onChange(kind: SignatureKind): void;
}) {
  return (
    <div role="group" aria-label={SIGN_COPY.signature.method}>
      <p className="text-small font-medium text-ink">{SIGN_COPY.signature.method}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {METHODS.map((method) => {
          const selected = method.value === kind;
          return (
            <button
              key={method.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(method.value)}
              className={`min-h-12 rounded-md border px-3 py-2 text-body font-medium leading-tight transition-colors ${
                selected
                  ? 'border-maroon-700 bg-sand text-ink ring-1 ring-maroon-700'
                  : 'border-line-strong bg-white text-ink-2 hover:border-maroon-500'
              }`}
            >
              {method.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The typed name in the script face, so the person sees what goes on the page. */
function TypedPreview({ name }: { name: string }) {
  return (
    <div
      role="img"
      aria-label={`${SIGN_COPY.signature.previewLabel}: ${name.trim() || SIGN_COPY.signature.nameLabel}`}
      className="flex min-h-28 items-center rounded-md border border-line bg-paper px-5 py-4"
    >
      <span aria-hidden="true" className={`sign-typed-preview ${signatureFont.className}`}>
        {name.trim() || ' '}
      </span>
    </div>
  );
}

/** Consent, name, the typed or drawn signature, and the one button that signs. */
export function SignatureBlock({ input, onChange, readToEnd, busy, error, onSubmit }: SignatureBlockProps) {
  const copy = SIGN_COPY.signature;
  return (
    <form
      noValidate
      aria-labelledby="sign-block-heading"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mt-8 rounded-xl border border-line bg-white p-5 sm:p-8"
    >
      <h2 id="sign-block-heading" className="font-serif text-h3 text-ink md:text-h2">
        {copy.heading}
      </h2>
      {!readToEnd && <p className="mt-2 text-body text-ink-3">{copy.locked}</p>}
      <fieldset disabled={!readToEnd || busy} className="mt-6 space-y-6 disabled:opacity-60">
        <Field id="sign-name" label={copy.nameLabel} hint={copy.nameHint}>
          <TextInput
            id="sign-name"
            value={input.typedName}
            onChange={(typedName) => onChange({ typedName })}
            autoComplete="name"
            describedBy="sign-name-hint"
            maxLength={200}
          />
        </Field>
        <MethodToggle kind={input.kind} onChange={(kind) => onChange({ kind })} />
        {input.kind === 'typed' ? (
          <TypedPreview name={input.typedName} />
        ) : (
          <SignaturePad onChange={(drawnImage) => onChange({ drawnImage })} disabled={!readToEnd || busy} />
        )}
        <CheckboxRow
          id="sign-consent"
          card
          checked={input.consent}
          onChange={(consent) => onChange({ consent })}
        >
          {copy.consent}
        </CheckboxRow>
      </fieldset>
      <p role="alert" aria-live="assertive" className="mt-5 min-h-6 text-small font-semibold text-error">
        {error}
      </p>
      <Button type="submit" loading={busy} disabled={!readToEnd} className="public-primary w-full sm:w-auto">
        {copy.button}
      </Button>
      <p className="mt-3 text-small text-ink-3">{copy.notFinal}</p>
    </form>
  );
}
