/** Pure helpers over the step config: which steps show, validation, pruning. */
import { isValidISODate } from '@/lib/deadlines/dates';
import type { WizardAnswers } from '@/lib/deadlines/types';
import { WIZARD_STEPS, type DateField, type WizardStep } from './steps';

export function activeSteps(answers: WizardAnswers): WizardStep[] {
  return WIZARD_STEPS.filter((step) => step.applies(answers));
}

/** The date fields visible for a step given the current choice. */
export function visibleFields(step: WizardStep, answers: WizardAnswers): DateField[] {
  const choice = step.choiceKey ? answers[step.choiceKey] : undefined;
  return (step.fields ?? []).filter(
    (f) => !f.showFor || (choice !== undefined && f.showFor.includes(choice)),
  );
}

/** Returns an error message, or null when the visitor may continue. */
export function validateStep(
  step: WizardStep,
  answers: WizardAnswers,
  today: string,
): string | null {
  if (step.kind === 'single' && step.choiceKey && !answers[step.choiceKey]) {
    return 'Pick one to continue.';
  }
  for (const field of visibleFields(step, answers)) {
    const value = answers[field.key];
    const name = field.label.toLowerCase();
    if (!value) {
      if (field.required) return `Please enter the ${name}. Your best guess is fine.`;
      continue;
    }
    if (!isValidISODate(value)) {
      return `That doesn't look like a real date. Please check the ${name}.`;
    }
    if (value > today) return 'That date is in the future. Please check it.';
  }
  return null;
}

/** Drops answers for steps that no longer apply, and dates for hidden fields. */
export function pruneAnswers(answers: WizardAnswers): WizardAnswers {
  const next: WizardAnswers = { ...answers };
  for (const step of WIZARD_STEPS) {
    const applies = step.applies(next);
    const visible = new Set(applies ? visibleFields(step, next).map((f) => f.key) : []);
    if (!applies && step.choiceKey) delete next[step.choiceKey];
    if (!applies && step.kind === 'multi') delete next.concerns;
    for (const field of step.fields ?? []) {
      if (!visible.has(field.key)) delete next[field.key];
    }
  }
  return next;
}
