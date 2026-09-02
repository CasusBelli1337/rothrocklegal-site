import { SITUATIONS, type IntakeAnswers } from '@/lib/intake/contract';
import {
  FUNDING_LABELS,
  KEY_DATE_FIELDS,
  PARTY_ROLE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  VALUE_RANGE_LABELS,
} from '@/lib/intake/copy';
import { VOICE_NOTE_SLOT } from '@/lib/intake/document-slots';
import type { IntakeState, StepId } from '@/lib/intake/state';

/** One block of the review summary; `step` is where "Edit" goes. */
export interface ReviewRow {
  label: string;
  step: StepId;
  lines: string[];
}

const STORY_PREVIEW_CHARS = 600;

function contactLines(a: IntakeAnswers): string[] {
  const { fullName, email, phone, city, county, replyBy } = a.contact;
  const place = [city, county].filter(Boolean).join(', ');
  return [fullName, email, phone ?? '', place, `Reply by ${replyBy}`].filter(Boolean);
}

function situationLines(a: IntakeAnswers): string[] {
  const labels = SITUATIONS.filter((s) => a.situations.includes(s.key)).map((s) => s.label);
  const relationship = RELATIONSHIP_OPTIONS.find((r) => r.value === a.relationship)?.label;
  return relationship ? [...labels, `You: ${relationship}`] : labels;
}

function partyLines(a: IntakeAnswers): string[] {
  return a.parties
    .filter((p) => p.name.trim())
    .map((p) => {
      const role = PARTY_ROLE_OPTIONS.find((r) => r.value === p.role)?.label ?? p.role;
      return `${p.name.trim()} – ${role}`;
    });
}

function storyLines(state: IntakeState): string[] {
  const story = state.answers.story.trim();
  const preview =
    story.length > STORY_PREVIEW_CHARS
      ? `${story.slice(0, STORY_PREVIEW_CHARS).trimEnd()}…`
      : story;
  const voice = state.files.some((f) => f.slot === VOICE_NOTE_SLOT) ? ['Voice note attached'] : [];
  return [preview || '(nothing yet)', ...voice];
}

function dateLines(state: IntakeState): string[] {
  return KEY_DATE_FIELDS.flatMap(({ key, label }) => {
    const value = state.answers.keyDates[key];
    if (value) return [`${label} ${value}`];
    if (state.unsureDates.includes(key)) return [`${label} Not sure`];
    return [];
  });
}

function documentLines(state: IntakeState): string[] {
  const files = state.files.filter((f) => f.slot !== VOICE_NOTE_SLOT);
  const lines = files.length > 0 ? files.map((f) => f.name) : ['No documents yet'];
  if (state.answers.missingDocuments.length > 0)
    lines.push(`Do not have: ${state.answers.missingDocuments.length} of the suggested documents`);
  return lines;
}

function scopeLines(a: IntakeAnswers): string[] {
  return [
    a.valueRange ? `In dispute: ${VALUE_RANGE_LABELS[a.valueRange]}` : '',
    a.funding ? `Paying: ${FUNDING_LABELS[a.funding]}` : '',
    a.urgencyNote ? `Coming up: ${a.urgencyNote}` : '',
    a.desiredOutcome ? `Wanted: ${a.desiredOutcome}` : '',
  ].filter(Boolean);
}

/** Everything the client entered, in step order, for the review screen. */
export function reviewRows(state: IntakeState): ReviewRow[] {
  const a = state.answers;
  return [
    { label: 'You', step: 'contact', lines: contactLines(a) },
    { label: 'What is going on', step: 'situations', lines: situationLines(a) },
    { label: 'People involved', step: 'parties', lines: partyLines(a) },
    { label: 'What happened', step: 'story', lines: storyLines(state) },
    { label: 'Dates', step: 'story', lines: dateLines(state) },
    { label: 'Documents', step: 'documents', lines: documentLines(state) },
    { label: 'Scope and cost', step: 'scope', lines: scopeLines(a) },
  ];
}
