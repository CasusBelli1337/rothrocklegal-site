/**
 * Statute citations → links to the official text on leginfo. Config over
 * code: LAW_CODES maps every code name the copy uses to leginfo's lawCode, and
 * the grammar below reads "Probate Code § 16061.7", "Prob. Code §§ 17200,
 * 16061.8", "sections 810 to 812", "CCP § 12a", "Family Code § 2211(c)", or a
 * bare "Probate Code 15642". A section number is linked only when a code name
 * qualifies it, so a lone "section 850" stays plain.
 */

import { PROSE_SKIP_TAGS, mapTextNodes } from './legal-cites-html';

export interface LawCode {
  /** leginfo's `lawCode` query value. */
  lawCode: string;
  /** Every spelling the copy uses; `&` also matches its `&amp;` form. */
  names: readonly string[];
}

export const LAW_CODES: readonly LawCode[] = [
  { lawCode: 'PROB', names: ['Probate Code', 'Prob. Code'] },
  { lawCode: 'CCP', names: ['Code of Civil Procedure', 'Code Civ. Proc.', 'CCP'] },
  { lawCode: 'WIC', names: ['Welfare and Institutions Code', 'Welf. & Inst. Code'] },
  { lawCode: 'FAM', names: ['Family Code', 'Fam. Code'] },
  { lawCode: 'CIV', names: ['Civil Code', 'Civ. Code'] },
  { lawCode: 'EVID', names: ['Evidence Code', 'Evid. Code'] },
  { lawCode: 'BPC', names: ['Business and Professions Code', 'Bus. & Prof. Code'] },
  { lawCode: 'PEN', names: ['Penal Code', 'Pen. Code'] },
  { lawCode: 'GOV', names: ['Government Code', 'Gov. Code'] },
  { lawCode: 'HSC', names: ['Health and Safety Code', 'Health & Saf. Code'] },
  { lawCode: 'CORP', names: ['Corporations Code', 'Corp. Code'] },
];

export const LEGINFO_SECTION_URL =
  'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml';

/** The href as it appears in HTML: `&amp;` between parameters, leginfo's trailing period after the number. */
export function leginfoSectionHref(lawCode: string, section: string): string {
  return `${LEGINFO_SECTION_URL}?lawCode=${lawCode}&amp;sectionNum=${section}.`;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "Welf. & Inst. Code" → a pattern that also accepts `&amp;` and any run of spaces. */
function namePattern(name: string): string {
  return name
    .split(/\s+/)
    .map(escapeRegExp)
    .join(String.raw`\s+`)
    .replace(/&/g, '(?:&amp;|&)');
}

/** A matched name, however spaced or escaped → its lawCode. */
function normalizeName(name: string): string {
  return name.replace(/&amp;/g, '&').replace(/\s+/g, ' ');
}

const CODE_BY_NAME = new Map(
  LAW_CODES.flatMap((code) => code.names.map((name) => [normalizeName(name), code.lawCode])),
);

// Longest names first so "Code of Civil Procedure" wins before any shorter alternative could.
const NAMES = LAW_CODES.flatMap((code) => code.names)
  .sort((a, b) => b.length - a.length)
  .map(namePattern)
  .join('|');

/** "16061.7", "12a", "366.2", "15610.30"; a subdivision "(b)(7)" is captured apart so it stays out of the URL. */
const SECTION = String.raw`(?<num>\d+[a-z]?(?:\.\d+[a-z]?)?)(?![A-Za-z0-9]|-[A-Za-z])(?<sub>(?:\([A-Za-z0-9]{1,3}\))*)`;
/** Between items of a plural citation: ", ", ", and ", " and ", " or ", " to ", " through ", an en dash or hyphen. */
const SEPARATOR = String.raw`(?:,\s+(?:(?:and|or)\s+)?|\s+(?:and|or|to|through)\s+|\s*[–-]\s*)`;

const HEAD = new RegExp(
  String.raw`(?<![A-Za-z])(?<name>${NAMES})\s+(?:(?<sign>§§|§|[Ss]ections?)\s+)?${SECTION}`,
  'g',
);
const NEXT_ITEM = new RegExp(`${SEPARATOR}${SECTION}`, 'y');

interface SectionGroups {
  num: string;
  sub: string;
}

function sectionGroups(match: RegExpMatchArray): SectionGroups {
  return { num: match.groups?.num ?? '', sub: match.groups?.sub ?? '' };
}

/** Only "§§" and "sections" announce a list or range; a singular sign links one number. */
function isPlural(sign: string | undefined): boolean {
  return sign === '§§' || /^sections$/i.test(sign ?? '');
}

function linkSection(lawCode: string, groups: SectionGroups): string {
  return `<a href="${leginfoSectionHref(lawCode, groups.num)}" rel="noopener">${groups.num}</a>${groups.sub}`;
}

/** The matched text with its final section number swapped for the link. */
function withLink(matched: string, lawCode: string, groups: SectionGroups): string {
  const head = matched.slice(0, matched.length - groups.num.length - groups.sub.length);
  return head + linkSection(lawCode, groups);
}

function linkText(text: string): string {
  let out = '';
  let pos = 0;
  for (const match of text.matchAll(HEAD)) {
    const start = match.index ?? 0;
    const lawCode = CODE_BY_NAME.get(normalizeName(match.groups?.name ?? ''));
    if (lawCode === undefined || start < pos) continue;
    let end = start + match[0].length;
    let html = withLink(match[0], lawCode, sectionGroups(match));
    if (isPlural(match.groups?.sign)) {
      NEXT_ITEM.lastIndex = end;
      for (let next = NEXT_ITEM.exec(text); next; next = NEXT_ITEM.exec(text)) {
        html += withLink(next[0], lawCode, sectionGroups(next));
        end = NEXT_ITEM.lastIndex;
      }
    }
    out += text.slice(pos, start) + html;
    pos = end;
  }
  return out + text.slice(pos);
}

/**
 * Wraps each code-qualified section number in a leginfo link. Text nodes only:
 * nothing inside a tag, an attribute, an existing `<a>`, a code span, or a
 * heading changes, so the pass is idempotent and never double-links.
 */
export function linkStatutes(html: string): string {
  return mapTextNodes(html, PROSE_SKIP_TAGS, linkText);
}
