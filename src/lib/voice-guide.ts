/**
 * Arthur's voice guide as data, for the copy tests (intake copy.test.ts, consent
 * copy.test.ts): the words and constructions that read as machine-written.
 * Imported only by tests; the site never ships it.
 */
export const BANNED_WORDS = [
  'delve',
  'explore',
  'navigate',
  'unlock',
  'leverage',
  'elevate',
  'empower',
  'transform',
  'foster',
  'harness',
  'landscape',
  'ecosystem',
  'synergy',
  'paradigm',
  'game-changer',
  'journey',
  'realm',
  'tapestry',
  'beacon',
  'furthermore',
  'moreover',
  'additionally',
  'robust',
  'seamless',
  'actionable',
  'expert',
  'specialist',
] as const;

export const BANNED_PHRASES: readonly RegExp[] = [
  /it'?s not just about/i,
  /in today'?s/i,
  /it'?s important to note/i,
  /the key takeaway/i,
  /imagine a world/i,
  /the future is bright/i,
  /that'?s a great question/i,
  /thrilled to/i,
  /i'?m humbled/i,
  /we can'?t wait/i,
];

/** Every string in a copy module, however deeply nested (functions are skipped; call them in the test). */
export function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}

/** Lines that use a banned word or phrase. */
export function voiceViolations(lines: readonly string[]): string[] {
  return lines.filter(
    (line) =>
      BANNED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(line)) ||
      BANNED_PHRASES.some((re) => re.test(line)),
  );
}
