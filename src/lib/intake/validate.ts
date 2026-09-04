import { VOICE_NOTE_SLOT } from './contract';
import type { IntakeState, StepId } from './state';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL.test(email.trim());
}

/** True when the story has words or a recorded voice note to stand in for them. */
export function hasStory(state: IntakeState): boolean {
  if (state.answers.story.trim()) return true;
  if (state.answers.voiceNoteFileId) return true;
  return state.files.some((file) => file.slot === VOICE_NOTE_SLOT);
}

type Validator = (state: IntakeState) => string | null;

/** Plain-English problems, one per step; null means the step may advance. */
const VALIDATORS: Partial<Record<StepId, Validator>> = {
  // Only the last start tile has anything to check; the first two just advance.
  start: (s) =>
    s.startTile < 2 || s.acks.every(Boolean) ? null : 'Please tick all three boxes to continue.',
  contact: (s) => {
    if (!s.answers.contact.fullName.trim()) return 'Please enter your name.';
    if (!isValidEmail(s.answers.contact.email))
      return 'Please enter an email address we can reply to.';
    return null;
  },
  story: (s) =>
    hasStory(s) ? null : 'Tell us what happened, even briefly. A few sentences is enough.',
  situations: (s) =>
    s.answers.situations.length > 0 ? null : 'Pick at least one. "Something else" is fine.',
  parties: (s) =>
    s.answers.parties.some((p) => p.name.trim()) || s.answers.partiesNote?.trim()
      ? null
      : 'Add at least one name, or tell us in the box who is involved.',
  // Documents, scope, follow-up, and review never block: every answer there is optional.
};

export function validateStep(step: StepId, state: IntakeState): string | null {
  return VALIDATORS[step]?.(state) ?? null;
}
