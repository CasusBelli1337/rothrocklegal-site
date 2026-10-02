/**
 * The "Your package" card on the done screen. Since 2026-10-02 the zip holds
 * one PDF summary memo (what the person told us and the deadlines that may
 * apply) plus their documents, organized and clearly named; nothing else.
 * Every link to it works once (the emailed one, and each one behind the
 * button), and the person can ask for a new emailed link.
 * Re-exported from copy.ts so the hygiene tests see it.
 */
export const PACKAGE_COPY = {
  title: 'Your package',
  what: 'A summary memo of what you told us, the deadlines that may apply, and your documents, organized and clearly named. It is yours to keep or to hand to another lawyer.',
  preparing:
    'We are putting your package together. It usually takes a minute or two. We also email you the link.',
  slow: 'This is taking longer than usual. The link will arrive by email when your package is ready.',
  download: 'Download your package',
  expires: (date: string): string => `You can download it until ${date}.`,
  /** Package security (2026-10-02): every link works once; the button gets a fresh one each time. */
  oneUse: 'The link in your email works once, so download your package and keep your own copy.',
  confidential: 'Your package is confidential and may be privileged.',
  newLink: 'Send me a new link',
  newLinkSending: 'Sending…',
  newLinkSent: (email: string): string =>
    email.trim()
      ? `A new link is on its way to ${email.trim()}.`
      : 'A new link is on its way to your email.',
  contents: (size: string, documents: number): string => {
    if (documents === 0) return `One zip file, ${size}.`;
    if (documents === 1) return `One zip file, ${size}, with the document you uploaded.`;
    return `One zip file, ${size}, with the ${documents} documents you uploaded.`;
  },
} as const;
