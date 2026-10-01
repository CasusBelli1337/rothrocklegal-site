/**
 * The "Your package" card on the done screen: the zip of everything the
 * person gave us plus a plain summary of the deadlines that may apply.
 * Re-exported from copy.ts so the hygiene tests see it.
 */
export const PACKAGE_COPY = {
  title: 'Your package',
  what: 'Everything you typed, said, and uploaded, in one zip file, plus a plain summary with the deadlines that may apply. It is yours to keep or to hand to another lawyer.',
  preparing:
    'We are putting your package together. It usually takes a minute or two. We also email you the link.',
  slow: 'This is taking longer than usual. The link will arrive by email when your package is ready.',
  download: 'Download your package',
  expires: (date: string): string => `The link works until ${date}.`,
  emailed: 'We also email you this link.',
  contents: (size: string, documents: number): string => {
    if (documents === 0) return `One zip file, ${size}.`;
    if (documents === 1) return `One zip file, ${size}, with the document you uploaded.`;
    return `One zip file, ${size}, with the ${documents} documents you uploaded.`;
  },
} as const;
