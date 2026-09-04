import { describe, expect, it } from 'vitest';
import { LAW_CODES, leginfoSectionHref, linkStatutes } from './legal-cites-statutes';

const href = (code: string, section: string): string =>
  `<a href="${leginfoSectionHref(code, section)}" rel="noopener">${section}</a>`;

describe('leginfoSectionHref', () => {
  it('uses leginfo`s trailing period and an HTML-escaped ampersand', () => {
    expect(leginfoSectionHref('PROB', '16061.7')).toBe(
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&amp;sectionNum=16061.7.',
    );
  });
});

describe('linkStatutes: one citation', () => {
  it('links "Probate Code § 16061.7" and keeps the sign and its non-breaking space', () => {
    expect(linkStatutes('<p>Probate Code § 16061.7 says so.</p>')).toBe(
      `<p>Probate Code § ${href('PROB', '16061.7')} says so.</p>`,
    );
  });

  it('accepts "section" and a bare code name before the number', () => {
    expect(linkStatutes('<p>Probate Code section 850 and Probate Code 15642.</p>')).toBe(
      `<p>Probate Code section ${href('PROB', '850')} and Probate Code ${href('PROB', '15642')}.</p>`,
    );
  });

  it('keeps a subdivision as plain text outside the link and the URL', () => {
    expect(linkStatutes('<p>Probate Code § 17200(b)(7) and Family Code § 2211(c).</p>')).toBe(
      `<p>Probate Code § ${href('PROB', '17200')}(b)(7) and Family Code § ${href('FAM', '2211')}(c).</p>`,
    );
  });

  it('handles a trailing letter, a decimal, and a sentence-ending period', () => {
    expect(linkStatutes('<p>CCP § 12a. Code of Civil Procedure § 366.2.</p>')).toBe(
      `<p>CCP § ${href('CCP', '12a')}. Code of Civil Procedure § ${href('CCP', '366.2')}.</p>`,
    );
  });

  it('reads every code name in the table, the &amp;-escaped forms included', () => {
    const cases: Array<[string, string]> = [
      ['Welfare and Institutions Code § 15610.70', 'WIC'],
      ['Welf. &amp; Inst. Code § 15657.5', 'WIC'],
      ['Welf. & Inst. Code § 15657.5', 'WIC'],
      ['Prob. Code § 859', 'PROB'],
      ['Code Civ. Proc. § 366.3', 'CCP'],
      ['Fam. Code § 721', 'FAM'],
      ['Civil Code § 3294', 'CIV'],
      ['Civ. Code § 1624', 'CIV'],
      ['Evidence Code § 1119', 'EVID'],
      ['Evid. Code § 1119', 'EVID'],
      ['Business and Professions Code § 6157.2', 'BPC'],
      ['Bus. &amp; Prof. Code § 6157.2', 'BPC'],
      ['Penal Code § 368', 'PEN'],
      ['Government Code § 70650', 'GOV'],
      ['Gov. Code § 70650', 'GOV'],
      ['Health and Safety Code § 7100', 'HSC'],
      ['Corporations Code § 17704.07', 'CORP'],
    ];
    for (const [text, code] of cases) {
      const section = text.slice(text.lastIndexOf(' ') + 1);
      expect(linkStatutes(`<p>${text}</p>`), text).toBe(
        `<p>${text.slice(0, text.lastIndexOf(' ') + 1)}${href(code, section)}</p>`,
      );
    }
    expect(LAW_CODES.map((c) => c.lawCode)).toContain('PROB');
  });

  it('never links a section that no code name qualifies, or a federal cite', () => {
    const html = '<p>File a section 850 petition. Basis follows 26 U.S.C. § 1014.</p>';
    expect(linkStatutes(html)).toBe(html);
  });

  it('does not read "Civil Code" out of "Code of Civil Procedure", or CCP out of a longer word', () => {
    expect(linkStatutes('<p>Code of Civil Procedure § 874.010</p>')).toBe(
      `<p>Code of Civil Procedure § ${href('CCP', '874.010')}</p>`,
    );
    expect(linkStatutes('<p>The ACCP § 5 rule.</p>')).toBe('<p>The ACCP § 5 rule.</p>');
  });

  it('does not treat a number glued to a word as a section ("120-day")', () => {
    const html = '<p>the Probate Code 120-day clock</p>';
    expect(linkStatutes(html)).toBe(html);
  });
});

describe('linkStatutes: lists and ranges', () => {
  it('links every item of a "§§" list', () => {
    expect(linkStatutes('<p>(Probate Code §§ 17200, 16061.8).</p>')).toBe(
      `<p>(Probate Code §§ ${href('PROB', '17200')}, ${href('PROB', '16061.8')}).</p>`,
    );
    expect(linkStatutes('<p>Family Code §§ 2210(c), 2211(c)</p>')).toBe(
      `<p>Family Code §§ ${href('FAM', '2210')}(c), ${href('FAM', '2211')}(c)</p>`,
    );
  });

  it('links "sections X and Y" and an Oxford-comma list', () => {
    expect(linkStatutes('<p>Probate Code sections 15642 and 17200.</p>')).toBe(
      `<p>Probate Code sections ${href('PROB', '15642')} and ${href('PROB', '17200')}.</p>`,
    );
    expect(linkStatutes('<p>Probate Code §§ 810, 811, and 812 apply.</p>')).toBe(
      `<p>Probate Code §§ ${href('PROB', '810')}, ${href('PROB', '811')}, and ${href('PROB', '812')} apply.</p>`,
    );
  });

  it('links both ends of a range ("to", "through", an en dash)', () => {
    expect(linkStatutes('<p>Probate Code sections 810 to 812.</p>')).toBe(
      `<p>Probate Code sections ${href('PROB', '810')} to ${href('PROB', '812')}.</p>`,
    );
    expect(linkStatutes('<p>Probate Code sections 16060 through 16064</p>')).toBe(
      `<p>Probate Code sections ${href('PROB', '16060')} through ${href('PROB', '16064')}</p>`,
    );
    expect(linkStatutes('<p>Probate Code §§ 16060–16064</p>')).toBe(
      `<p>Probate Code §§ ${href('PROB', '16060')}–${href('PROB', '16064')}</p>`,
    );
  });

  it('stops a list at prose, and a singular sign never starts one', () => {
    expect(linkStatutes('<p>Probate Code §§ 16060 and 16062 and the court agreed.</p>')).toBe(
      `<p>Probate Code §§ ${href('PROB', '16060')} and ${href('PROB', '16062')} and the court agreed.</p>`,
    );
    expect(linkStatutes('<p>Probate Code § 850, 2 years later.</p>')).toBe(
      `<p>Probate Code § ${href('PROB', '850')}, 2 years later.</p>`,
    );
  });
});

describe('linkStatutes: HTML safety', () => {
  it('leaves an existing link alone and links the neighbour once', () => {
    const linked = `<p>Probate Code § <a href="https://x.test/">16061.7</a> and Probate Code § 850</p>`;
    expect(linkStatutes(linked)).toBe(
      `<p>Probate Code § <a href="https://x.test/">16061.7</a> and Probate Code § ${href('PROB', '850')}</p>`,
    );
  });

  it('ignores text inside a tag attribute, a code span, and a heading', () => {
    const html =
      '<h2 id="probate-code-16061-8">Probate Code § 16061.8</h2>' +
      '<p><img alt="Probate Code § 850" /><code>Probate Code § 850</code></p>';
    expect(linkStatutes(html)).toBe(html);
  });

  it('works inside bold, table cells, and list items', () => {
    expect(linkStatutes('<td><strong>Probate Code § 16061.8</strong></td>')).toBe(
      `<td><strong>Probate Code § ${href('PROB', '16061.8')}</strong></td>`,
    );
  });

  it('is idempotent', () => {
    const once = linkStatutes('<p>Probate Code §§ 17200, 16061.8 and Penal Code § 368(d).</p>');
    expect(linkStatutes(once)).toBe(once);
    expect(once.match(/<a /g)).toHaveLength(3);
  });

  it('never produces an em dash', () => {
    expect(linkStatutes('<p>Probate Code §§ 810–812</p>')).not.toContain('\u2014');
  });
});
