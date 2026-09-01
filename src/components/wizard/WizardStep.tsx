'use client';

import { useEffect, useRef } from 'react';
import type { Concern, DateAnswerKey, WizardAnswers } from '@/lib/deadlines/types';
import {
  CONCERN_OPTIONS,
  type ChoiceKey,
  type ChoiceOption,
  type DateField,
  type WizardStep,
} from './steps';
import { visibleFields } from './steps-logic';

interface WizardStepProps {
  step: WizardStep;
  answers: WizardAnswers;
  error: string | null;
  /** Move keyboard / screen-reader focus to the question when the step appears. */
  focusOnMount: boolean;
  onChoice(key: ChoiceKey, value: string): void;
  onToggleConcern(concern: Concern, checked: boolean): void;
  onDate(key: DateAnswerKey, value: string): void;
}

function ChoiceCard({
  name,
  type,
  option,
  checked,
  onChange,
}: {
  name: string;
  type: 'radio' | 'checkbox';
  option: ChoiceOption;
  checked: boolean;
  onChange(checked: boolean): void;
}) {
  const id = `${name}-${option.value}`;
  return (
    <label htmlFor={id} className={`wizard-choice ${checked ? 'is-selected' : ''}`}>
      <input
        id={id}
        type={type}
        name={name}
        value={option.value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-base font-semibold text-black">{option.label}</span>
        {option.hint && <span className="mt-0.5 block text-sm text-navy-light">{option.hint}</span>}
      </span>
    </label>
  );
}

/** Radio cards for a single-choice step, checkbox cards for the concerns step. */
function ChoiceGroup({
  step,
  answers,
  questionId,
  onChoice,
  onToggleConcern,
}: Pick<WizardStepProps, 'step' | 'answers' | 'onChoice' | 'onToggleConcern'> & {
  questionId: string;
}) {
  if (step.kind === 'single' && step.choiceKey && step.options) {
    const key = step.choiceKey;
    return (
      <div className="mt-6 grid gap-3" role="radiogroup" aria-labelledby={questionId}>
        {step.options.map((option) => (
          <ChoiceCard
            key={option.value}
            name={key}
            type="radio"
            option={option}
            checked={answers[key] === option.value}
            onChange={() => onChoice(key, option.value)}
          />
        ))}
      </div>
    );
  }
  if (step.kind !== 'multi') return null;
  const concerns = answers.concerns ?? [];
  return (
    <div className="mt-6 grid gap-3">
      {CONCERN_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          name="concerns"
          type="checkbox"
          option={option}
          checked={concerns.includes(option.value)}
          onChange={(checked) => onToggleConcern(option.value, checked)}
        />
      ))}
    </div>
  );
}

function DateInput({
  field,
  value,
  onChange,
}: {
  field: DateField;
  value: string;
  onChange(value: string): void;
}) {
  const id = `wizard-${field.key}`;
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block text-base font-semibold text-black">
        {field.label}
        {!field.required && (
          <span className="ml-2 text-sm font-normal text-navy-light">(optional)</span>
        )}
      </label>
      <p id={`${id}-help`} className="mt-1 text-sm text-navy-light">
        {field.help}
      </p>
      <input
        id={id}
        type="date"
        className="wizard-date mt-2"
        value={value}
        max="2099-12-31"
        aria-describedby={`${id}-help`}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Renders one question: the choice cards and/or date inputs, plus the error line. */
export function WizardStepView(props: WizardStepProps) {
  const { step, answers, error, focusOnMount, onDate } = props;
  const questionId = `wizard-q-${step.id}`;
  const legendRef = useRef<HTMLLegendElement>(null);

  useEffect(() => {
    if (focusOnMount) legendRef.current?.focus();
  }, [focusOnMount]);

  return (
    <fieldset
      className="wizard-enter border-0 p-0"
      aria-describedby={error ? 'wizard-error' : undefined}
    >
      <legend
        id={questionId}
        ref={legendRef}
        tabIndex={-1}
        className="font-serif-accent text-2xl font-semibold text-black outline-none md:text-3xl"
      >
        {step.question}
      </legend>
      {step.lead && <p className="mt-3 text-base text-navy-light">{step.lead}</p>}
      <ChoiceGroup {...props} questionId={questionId} />
      {visibleFields(step, answers).map((field) => (
        <DateInput
          key={field.key}
          field={field}
          value={answers[field.key] ?? ''}
          onChange={(value) => onDate(field.key, value)}
        />
      ))}
      <p
        id="wizard-error"
        role="alert"
        aria-live="assertive"
        className="mt-4 min-h-6 text-sm font-semibold text-[#9f1239]"
      >
        {error}
      </p>
    </fieldset>
  );
}
