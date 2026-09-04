import { SITUATIONS, VOICE_NOTE_SLOT, type IntakeAnswers } from '@/lib/intake/contract';
import { FOLLOW_UP_REVIEW, FUNDING_LABELS, VALUE_RANGE_LABELS } from '@/lib/intake/copy';
import { followUpLines } from '@/lib/intake/follow-up-format';
import { whatWeUnderstood } from '@/lib/intake/readings';
import { hasFollowUp, type IntakeState, type StepId } from '@/lib/intake/state';

/** One block of the review summary; `step` is where "Edit" goes. */
export interface ReviewRow {
  label: string;
  step: StepId;
  lines: string[];
}

const STORY_PREVIEW_CHARS = 240;

function contactLines(a: IntakeAnswers): string[] {
  const { fullName, email, phone, replyBy } = a.contact;
  return [fullName, email, phone ?? '', `Reply by ${replyBy}`].filter(Boolean);
}

/** The model's one-line reading when it ran, otherwise the start of the story itself. */
function storyLines(state: IntakeState): string[] {
  const understood = whatWeUnderstood(state);
  const story = state.answers.story.trim();
  const preview =
    story.length > STORY_PREVIEW_CHARS
      ? `${story.slice(0, STORY_PREVIEW_CHARS).trimEnd()}…`
      : story;
  const voice = state.files.some((f) => f.slot === VOICE_NOTE_SLOT) ? ['Voice note attached'] : [];
  return [understood ?? preview, ...voice].filter(Boolean);
}

function situationLines(a: IntakeAnswers): string[] {
  return SITUATIONS.filter((s) => a.situations.includes(s.key)).map((s) => s.label);
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function partyLines(a: IntakeAnswers): string[] {
  const named = a.parties.filter((p) => p.name.trim());
  const lines = named.length > 0 ? [count(named.length, 'person named', 'people named')] : [];
  if (a.partiesNote?.trim()) lines.push('Plus a note from you');
  return lines;
}

function documentLines(state: IntakeState): string[] {
  const files = state.files.filter((f) => f.slot !== VOICE_NOTE_SLOT);
  return [files.length > 0 ? count(files.length, 'file sent', 'files sent') : 'No documents yet'];
}

function scopeLines(a: IntakeAnswers): string[] {
  return [
    a.valueRange ? `In dispute: ${VALUE_RANGE_LABELS[a.valueRange]}` : '',
    a.funding ? `Paying: ${FUNDING_LABELS[a.funding]}` : '',
    a.urgencyNote ? `Coming up: ${a.urgencyNote}` : '',
    a.desiredOutcome ? `Wanted: ${a.desiredOutcome}` : '',
  ].filter(Boolean);
}

/** The answers to the questions the evaluation asked, one line each, in its order. */
function followUpRow(state: IntakeState): ReviewRow {
  return {
    label: FOLLOW_UP_REVIEW.label,
    step: 'follow-up',
    lines: followUpLines(state.evaluation?.modules ?? [], state.followUpAnswers, state.files),
  };
}

/** The compact summary for the review screen, in step order. */
export function reviewRows(state: IntakeState): ReviewRow[] {
  const a = state.answers;
  return [
    { label: 'You', step: 'contact', lines: contactLines(a) },
    { label: 'What we understood', step: 'story', lines: storyLines(state) },
    { label: 'What is going on', step: 'situations', lines: situationLines(a) },
    { label: 'Documents', step: 'documents', lines: documentLines(state) },
    { label: 'People involved', step: 'parties', lines: partyLines(a) },
    { label: 'Scope and cost', step: 'scope', lines: scopeLines(a) },
    ...(hasFollowUp(state) ? [followUpRow(state)] : []),
  ];
}
