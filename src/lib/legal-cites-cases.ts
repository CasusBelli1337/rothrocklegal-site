/**
 * Case names → `<em>`. Reads "Rice v. Clark", "Wells Fargo Bank v. Superior
 * Court", "Gilmaker v. Bank of America", "Estate of Heggstad", "In re Marriage
 * of Greenway", "Conservatorship of Lefkowitz". Text nodes only, never inside
 * an existing `<em>`/`<i>`/`<a>`, a code span, or a heading, so the pass is
 * idempotent. Only the name is italicized; a reporter cite after it stays plain.
 */

import { PROSE_SKIP_TAGS, mapTextNodes } from './legal-cites-html';

/**
 * A capitalized word that directly precedes a party name is part of the
 * sentence, not the case ("In Rice v. Clark", "Under Rice v. Clark"). Extend
 * this list when a new lead word shows up in the copy.
 */
export const CASE_LEAD_STOP_WORDS: readonly string[] = `
  In Under See But And The When If As Because After Before Since Compare Contrast Both Even While
  Although Though Then So Yet For Or Nor That This Like Unlike Consider Take Read Later Here
  There Also Where Which Who Whom What Why How Of On To With Without From By At Into Per Until
  Unless Once Our Your Their His Her Its My We You They He She It Not Only Just Recently
  Similarly Likewise Conversely However Finally First Second Third Next Last Instead Still Thus
  Hence Therefore Meanwhile Moreover Indeed Notably Again Now Today Cite Citing Cited Accord
  Apply Applying Following Quoting Given Despite Absent Against Through Whether Whereas Whenever
  Otherwise Nevertheless Nonetheless Rather Perhaps Maybe Yes No Well Enter Recall Note Think
  Imagine Suppose Assume Picture Say Call Meet Remember
`
  .trim()
  .split(/\s+/);

/** Party-name abbreviations that keep their period ("Inc.", "Co."); every other word ends without one. */
const ABBREVIATIONS = ['Inc.', 'Co.', 'Corp.', 'Ltd.', 'Assn.', 'Bros.', 'Ins.', 'Mfg.'];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "Clark", "Winston-Levin", "O'Brien", "Ass'n", "U.S.", "Inc.". */
const WORD = String.raw`(?:${ABBREVIATIONS.map(escapeRegExp).join('|')}|(?:[A-Z]\.){2,}|[A-Z][A-Za-z'’-]*)`;
/** Lowercase connectors inside a party name ("Bank of America", "Smith &amp; Jones"). */
const JOINER = String.raw`(?:of|&amp;|&)`;
/** One to five capitalized words, connectors allowed between them. */
const PARTY = String.raw`${WORD}(?:\s(?:${JOINER}\s)?${WORD}){0,4}`;
const NOT_LEAD = String.raw`(?!(?:${CASE_LEAD_STOP_WORDS.join('|')})\b)`;
const VERSUS = String.raw`${NOT_LEAD}${PARTY}\sv\.\s${PARTY}`;
const IN_RE = String.raw`(?:In re (?:(?:Marriage|Estate|Conservatorship|Guardianship) of )?|(?:Estate|Marriage|Conservatorship|Guardianship) of )${WORD}(?:\s${WORD}){0,2}`;

const CASE_NAME = new RegExp(String.raw`(?<![A-Za-z'’-])(?:${VERSUS}|${IN_RE})`, 'g');
const POSSESSIVE = /['’]s$/;

/** A trailing possessive ("Rice v. Clark's holding") stays outside the italics. */
function emphasize(name: string): string {
  const possessive = POSSESSIVE.exec(name);
  const core = possessive ? name.slice(0, possessive.index) : name;
  return `<em>${core}</em>${possessive ? possessive[0] : ''}`;
}

const SKIP_TAGS: readonly string[] = [...PROSE_SKIP_TAGS, 'em', 'i'];

export function italicizeCases(html: string): string {
  return mapTextNodes(html, SKIP_TAGS, (text) => text.replace(CASE_NAME, emphasize));
}
