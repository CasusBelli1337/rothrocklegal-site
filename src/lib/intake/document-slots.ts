import { DOCUMENT_SLOTS, type DocumentSlot, type SituationKey } from './contract';

/** Slots suggested for the chosen situations; "all" slots always show, in catalog order. */
export function slotsForSituations(situations: readonly SituationKey[]): DocumentSlot[] {
  return DOCUMENT_SLOTS.filter(
    (slot) => slot.situations === 'all' || slot.situations.some((key) => situations.includes(key)),
  );
}

/** Upload rules shown on the documents step (INTAKE-SPEC §2 step 5). */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_FILES = 20;
export const VOICE_NOTE_SLOT = 'voice-note';

export const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.docx',
  '.eml',
  '.msg',
  '.txt',
] as const;

export const ACCEPTED_TYPES_LABEL =
  'PDF, JPG, PNG, HEIC, Word (.docx), email (.eml, .msg), or plain text. Up to 25 MB each, 20 files total.';

/** `accept` attribute for the file input. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(',');

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/** Plain-English reason a file cannot be sent, or null when it can. */
export function fileProblem(
  file: { name: string; size: number },
  existingCount: number,
): string | null {
  if (existingCount >= MAX_FILES)
    return `You can send up to ${MAX_FILES} files. Remove one to add another.`;
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(extensionOf(file.name)))
    return `We cannot read "${file.name}". Send a PDF, photo, Word file, email, or text file.`;
  if (file.size > MAX_FILE_BYTES)
    return `"${file.name}" is over 25 MB. Try a smaller scan or split it into parts.`;
  if (file.size === 0) return `"${file.name}" is empty.`;
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
