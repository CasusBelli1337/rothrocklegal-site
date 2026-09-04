'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import type { Party } from '@/lib/intake/contract';
import {
  CONFLICT_WHY,
  EVALUATION_BACKGROUND,
  EVALUATION_FALLBACK,
  EVALUATION_KEEP_GOING,
  EVALUATION_READING_TITLE,
  PARTIES_COPY,
  PARTY_ROLE_OPTIONS,
} from '@/lib/intake/copy';
import { needsEvaluation } from '@/lib/intake/readings';
import { useEvaluation, type EvaluationController } from '@/lib/intake/use-evaluation';
import type { IntakeController } from '@/lib/intake/use-intake';
import { Field, SelectInput, TextArea, TextInput, hintId } from './FormFields';
import { EvaluationStages } from './Reading';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';
import { WhyWeAsk } from './WhyWeAsk';

const EMPTY_ROW: Party = { name: '', role: 'decedent' };

/**
 * One key per row that outlives its position. Keyed by index, removing a person
 * would hand their DOM row to the next person, so anything half typed below the
 * removed row lost its focus and its caret.
 */
function useRowKeys(count: number) {
  const keys = useRef<number[]>([]);
  const nextKey = useRef(0);
  if (keys.current.length > count) keys.current.length = count;
  while (keys.current.length < count) keys.current.push(nextKey.current++);
  return useMemo(
    () => ({
      at: (index: number) => keys.current[index],
      added: () => keys.current.push(nextKey.current++),
      removed: (index: number) => keys.current.splice(index, 1),
    }),
    [],
  );
}

/** The optional line under each person: how they are related, or anything else we should know. */
function PartyNote({
  id,
  party,
  onChange,
}: {
  id: string;
  party: Party;
  onChange(party: Party): void;
}) {
  return (
    <div className="mt-3">
      <Field id={id} label={PARTIES_COPY.personNoteLabel} optional hint={PARTIES_COPY.personNoteHint}>
        <TextInput
          id={id}
          value={party.note ?? ''}
          onChange={(note) => onChange({ ...party, note: note || undefined })}
          describedBy={hintId(id)}
          autoComplete="off"
        />
      </Field>
    </div>
  );
}

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
    <li className="border border-line bg-white p-3">
      {/* The name takes the room: people write "Leila Reyes Stadler (mother)" when it is too narrow. */}
      <div className="grid gap-3 sm:grid-cols-[3fr_2fr_auto] sm:items-end">
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
      </div>
      <PartyNote id={`party-${index}-note`} party={party} onChange={onChange} />
    </li>
  );
}

/** The editable list (one empty row when nobody is named yet), "Add someone", and why we ask. */
function PartiesList({ intake }: { intake: IntakeController }) {
  const stored = intake.state.answers.parties;
  const parties = stored.length > 0 ? stored : [EMPTY_ROW];
  const keys = useRowKeys(parties.length);
  const setParties = (next: Party[]) => intake.patchAnswers({ parties: next });
  const add = () => {
    keys.added();
    setParties([...parties, { name: '', role: 'family' }]);
  };
  const remove = (index: number) => {
    keys.removed(index);
    setParties(parties.filter((_, i) => i !== index));
  };
  return (
    <>
      <ul className="space-y-3">
        {parties.map((party, index) => (
          <PartyRow
            key={keys.at(index)}
            index={index}
            party={party}
            onChange={(next) => setParties(parties.map((p, i) => (i === index ? next : p)))}
            onRemove={() => remove(index)}
          />
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button variant="secondary" size="sm" onClick={add}>
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

/** After the wait has run long: the person may move on; the server finishes reading on its own. */
function KeepGoing({ intake, evaluation }: { intake: IntakeController; evaluation: EvaluationController }) {
  const keepGoing = () => {
    evaluation.cancel();
    intake.markEvaluationBackground();
  };
  return (
    <div className="wizard-banner mt-6" role="status">
      <p className="text-body font-semibold text-ink">{EVALUATION_KEEP_GOING.title}</p>
      <p className="mt-1 text-body text-ink-2">{EVALUATION_KEEP_GOING.body}</p>
      <div className="mt-4">
        <Button variant="secondary" onClick={keepGoing}>
          {EVALUATION_KEEP_GOING.button}
        </Button>
      </div>
    </div>
  );
}

/** The one-line note above the list when the model did not supply it: still reading, or could not read. */
function ManualNote({ background }: { background: boolean }) {
  return (
    <div className="wizard-banner mb-4" role="status">
      <p className="text-body text-ink">{background ? EVALUATION_BACKGROUND : EVALUATION_FALLBACK}</p>
    </div>
  );
}

/**
 * Step 5: the model reads the story and the uploads (pass 2) behind three
 * moving lines; then the people it found, editable, for the conflict check.
 * A long read offers "keep going"; when the evaluation is unavailable or still
 * running in the background, the list is seeded from pass 1 instead.
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
        {evaluation.slow && <KeepGoing intake={intake} evaluation={evaluation} />}
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
      {!fromModel && <ManualNote background={state.readingInBackground} />}
      <PartiesList intake={intake} />
      <PartiesNote intake={intake} />
    </StepFrame>
  );
}
