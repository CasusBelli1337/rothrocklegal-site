'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Party } from '@/lib/intake/contract';
import {
  CONFLICT_WHY,
  EVALUATION_FALLBACK,
  EVALUATION_READING_TITLE,
  PARTIES_COPY,
  PARTY_ROLE_OPTIONS,
} from '@/lib/intake/copy';
import { needsEvaluation } from '@/lib/intake/readings';
import { useEvaluation } from '@/lib/intake/use-evaluation';
import type { IntakeController } from '@/lib/intake/use-intake';
import { Field, SelectInput, TextArea, TextInput, hintId } from './FormFields';
import { EvaluationStages } from './Reading';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';
import { WhyWeAsk } from './WhyWeAsk';

const EMPTY_ROW: Party = { name: '', role: 'decedent' };

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
    <li className="grid gap-3 border border-line bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
        {PARTIES_COPY.remove}
      </button>
    </li>
  );
}

/** The editable list (one empty row when nobody is named yet), "Add someone", and why we ask. */
function PartiesList({ intake }: { intake: IntakeController }) {
  const stored = intake.state.answers.parties;
  const parties = stored.length > 0 ? stored : [EMPTY_ROW];
  const setParties = (next: Party[]) => intake.patchAnswers({ parties: next });
  return (
    <>
      <ul className="space-y-3">
        {parties.map((party, index) => (
          <PartyRow
            key={index}
            index={index}
            party={party}
            onChange={(next) => setParties(parties.map((p, i) => (i === index ? next : p)))}
            onRemove={() => setParties(parties.filter((_, i) => i !== index))}
          />
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setParties([...parties, { name: '', role: 'family' }])}
        >
          {PARTIES_COPY.add}
        </Button>
        <WhyWeAsk>{CONFLICT_WHY}</WhyWeAsk>
      </div>
    </>
  );
}

function PartiesNote({ intake }: { intake: IntakeController }) {
  return (
    <div className="mt-5">
      <Field id="parties-note" label={PARTIES_COPY.noteLabel} optional hint={PARTIES_COPY.noteHint}>
        <TextArea
          id="parties-note"
          value={intake.state.answers.partiesNote ?? ''}
          onChange={(value) => intake.patchAnswers({ partiesNote: value || undefined })}
          rows={2}
          describedBy={hintId('parties-note')}
        />
      </Field>
    </div>
  );
}

/**
 * Step 5: the model reads the story and the uploads (pass 2) behind three
 * moving lines; then the people it found, editable, for the conflict check.
 * When the evaluation is unavailable the list is seeded from pass 1 instead.
 */
export function StepParties({ intake }: StepProps) {
  const { state } = intake;
  const reading = needsEvaluation(state);
  const evaluation = useEvaluation({
    session: state.session,
    answers: state.answers,
    onReady: intake.receiveEvaluation,
    onUnavailable: intake.markEvaluationUnavailable,
  });
  useEffect(() => {
    if (reading && evaluation.phase === 'idle') void evaluation.start();
  }, [reading, evaluation]);

  if (reading) {
    return (
      <StepFrame
        intake={intake}
        title={EVALUATION_READING_TITLE}
        lead={null}
        footer={<StepNav intake={intake} busy />}
      >
        <EvaluationStages phase={evaluation.phase} />
      </StepFrame>
    );
  }

  const fromModel = state.evaluation !== null;
  const submit = () => {
    intake.patchAnswers({ parties: state.answers.parties.filter((p) => p.name.trim()) });
    void intake.next();
  };
  return (
    <StepFrame
      intake={intake}
      lead={fromModel ? PARTIES_COPY.found : PARTIES_COPY.manual}
      onSubmit={submit}
    >
      {!fromModel && (
        <div className="wizard-banner mb-4" role="status">
          <p className="text-body text-ink">{EVALUATION_FALLBACK}</p>
        </div>
      )}
      <PartiesList intake={intake} />
      <PartiesNote intake={intake} />
    </StepFrame>
  );
}
