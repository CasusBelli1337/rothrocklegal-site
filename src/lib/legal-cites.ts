/**
 * The cite passes the article and practice renderers run over block HTML:
 * statute citations become leginfo links and case names become italics. Both
 * touch text nodes only and skip headings, links, and code, so the TOC labels,
 * FAQ answers, and the search index (all plain text) never see them. Running
 * a pass twice changes nothing.
 */

import { italicizeCases } from './legal-cites-cases';
import { linkStatutes } from './legal-cites-statutes';

export { CASE_LEAD_STOP_WORDS, italicizeCases } from './legal-cites-cases';
export { LAW_CODES, leginfoSectionHref, linkStatutes, type LawCode } from './legal-cites-statutes';
export { PROSE_SKIP_TAGS } from './legal-cites-html';

/** Statute links first, then case italics; the order does not matter for the result. */
export function enrichLegalCites(html: string): string {
  return italicizeCases(linkStatutes(html));
}
