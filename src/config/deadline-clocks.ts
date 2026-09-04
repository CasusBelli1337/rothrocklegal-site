/**
 * The three clocks the library's "How long do I have?" card lists under its
 * lead, so the card carries substance instead of empty space beside the
 * featured article (Arthur, 2026-09-03). Neutral framing (no lens): every
 * line traces to src/lib/deadlines/rules*.ts and RULES.md.
 */
export interface DeadlineClock {
  /** The clock, e.g. "120 days". */
  clock: string;
  /** What it applies to, in plain words. */
  what: string;
  /** The statute, rendered as a citation. */
  statute: string;
}

export const DEADLINE_CLOCKS: readonly DeadlineClock[] = [
  {
    clock: '120 days',
    what: 'to contest a trust after the trustee’s notice is mailed',
    statute: 'Probate Code § 16061.8',
  },
  {
    clock: 'One year',
    what: 'from the death for claims against the person who died',
    statute: 'Code of Civil Procedure §§ 366.2, 366.3',
  },
  {
    clock: 'Three years',
    what: 'after an accounting to sue a trustee for what it shows',
    statute: 'Probate Code § 16460',
  },
];
