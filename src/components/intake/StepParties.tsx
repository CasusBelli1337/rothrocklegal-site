'use client';

import { Button } from '@/components/ui/Button';
import type { Party } from '@/lib/intake/contract';
import { CONFLICT_WHY, PARTY_ROLE_OPTIONS } from '@/lib/intake/copy';
import { Field, SelectInput, TextInput } from './FormFields';
import { StepFrame } from './StepFrame';
import type { StepProps } from './step-props';
import { WhyWeAsk } from './WhyWeAsk';

/** The rows shown before the client adds anyone. */
const SEED_ROWS: Party[] = [
  { name: '', role: 'decedent' },
  { name: '', role: 'trustee' },
];

function PartyRow({
  index,
  party,
  onChange,
  onRemove,
}: {
  index: number;
  party: Party;
  onChange(party: Party): void;
  onRemove(): void;
}) {
  const nameId = `party-${index}-name`;
  const roleId = `party-${index}-role`;
  return (
    <li className="grid gap-4 border border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Field id={nameId} label={index === 0 ? 'Name' : `Name (person ${index + 1})`}>
        <TextInput
          id={nameId}
          value={party.name}
          onChange={(name) => onChange({ ...party, name })}
          // Otherwise the phone offers to fill in the visitor's own name for the person who died.
          autoComplete="off"
        />
      </Field>
      <Field id={roleId} label="Who are they?">
        <SelectInput<Party['role']>
          id={roleId}
          value={party.role}
          onChange={(role) => onChange({ ...party, role: role || 'other' })}
          options={PARTY_ROLE_OPTIONS}
        />
      </Field>
      <button
        type="button"
        onClick={onRemove}
        className="h-12 text-small text-ink-3 underline underline-offset-3 hover:text-maroon-700"
      >
        Remove
      </button>
    </li>
  );
}

/** Step 3: the people involved, for the conflict check. */
export function StepParties({ intake }: StepProps) {
  const stored = intake.state.answers.parties;
  const parties = stored.length > 0 ? stored : SEED_ROWS;
  const setParties = (next: Party[]) => intake.patchAnswers({ parties: next });
  const replace = (index: number, party: Party) =>
    setParties(parties.map((p, i) => (i === index ? party : p)));
  const remove = (index: number) => setParties(parties.filter((_, i) => i !== index));
  const submit = () => {
    setParties(parties.filter((p) => p.name.trim()));
    void intake.next();
  };

  return (
    <StepFrame intake={intake} onSubmit={submit}>
      <WhyWeAsk>{CONFLICT_WHY}</WhyWeAsk>
      <p className="mt-2 text-small text-ink-3">
        The person who died, the trustee or executor, other family, anyone on the other side, and
        their lawyer if you know the name.
      </p>
      <ul className="mt-6 space-y-4">
        {parties.map((party, index) => (
          <PartyRow
            key={index}
            index={index}
            party={party}
            onChange={(next) => replace(index, next)}
            onRemove={() => remove(index)}
          />
        ))}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={() => setParties([...parties, { name: '', role: 'family' }])}
      >
        Add another person
      </Button>
    </StepFrame>
  );
}
