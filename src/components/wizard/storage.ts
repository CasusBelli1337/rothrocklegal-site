import type { WizardAnswers } from '@/lib/deadlines/types';

/** One localStorage key holds the whole wizard so a refresh restores it. */
export const WIZARD_STORAGE_KEY = 'rothrock-deadline-wizard';

export interface WizardState {
  version: 1;
  answers: WizardAnswers;
  stepIndex: number;
  showResults: boolean;
}

export const EMPTY_WIZARD_STATE: WizardState = {
  version: 1,
  answers: {},
  stepIndex: 0,
  showResults: false,
};

function isWizardState(value: unknown): value is WizardState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.answers === 'object' &&
    v.answers !== null &&
    typeof v.stepIndex === 'number' &&
    typeof v.showResults === 'boolean'
  );
}

export function loadWizardState(): WizardState | null {
  try {
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isWizardState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWizardState(state: WizardState): void {
  try {
    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: the wizard still works for this visit.
  }
}

export function clearWizardState(): void {
  try {
    window.localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
