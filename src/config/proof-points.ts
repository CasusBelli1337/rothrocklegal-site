import { site } from './site';
import { arthurRothrock } from './team/arthur-rothrock';

/**
 * The six facts on the homepage proof strip (show, not tell). Every line is
 * derived from Arthur's verified config, never typed here, so a change to the
 * bio or a credential flows to the strip and a missing fact fails the build.
 */

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

/** 10 → 'Ten'; larger counts stay digits. */
export function countWord(n: number): string {
  const word = NUMBER_WORDS[n];
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : String(n);
}

/** 'Licensed in California, State Bar #312704 (2016)' → 2016. */
export function admittedYear(barStatus: string | undefined): number {
  const match = barStatus?.match(/\((\d{4})\)/);
  if (!match) throw new Error('Proof strip needs a verified bar admission year');
  return Number(match[1]);
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Proof strip: ${what} is missing from config`);
  return value;
}

export const PROOF_POINT_COUNT = 6;

export function proofPoints(): readonly string[] {
  const a = arthurRothrock;
  const year = admittedYear(a.barStatus);
  const firm = need(a.priorFirm, 'prior firm');
  const rising = need(
    a.credentials.find((c) => c.name.includes('Rising Stars')),
    'Rising Stars credential',
  );
  const ones = need(
    a.credentials.find((c) => c.name.includes('Ones to Watch')),
    'Ones to Watch credential',
  );
  const areas = need(ones.detail, 'Ones to Watch practice areas').split(';').length;
  const viceChair = need(
    a.leadership.find((r) => r.role === 'Vice Chair'),
    'Vice Chair role',
  );
  const inn = need(
    a.memberships.find((m) => m.includes('Inn of Court')),
    'Inn of Court membership',
  );
  const points = [
    `${countWord(site.copyrightYear - year)} years in California courts, since ${year}`,
    `Trained at ${firm.name} in ${firm.city}`,
    `${rising.name}, every year ${need(rising.years, 'Rising Stars years')}`,
    `${ones.name} in ${countWord(areas).toLowerCase()} practice areas, ${need(ones.years, 'Ones to Watch years')}`,
    `${viceChair.role}, ${viceChair.organization.replace('American Bar Association', 'ABA')}`,
    `Member, ${inn}`,
  ];
  if (points.length !== PROOF_POINT_COUNT) {
    throw new Error(`Proof strip expects ${PROOF_POINT_COUNT} points, built ${points.length}`);
  }
  return points;
}
