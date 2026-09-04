import { describe, expect, it } from 'vitest';
import { italicizeCases } from './legal-cites-cases';

describe('italicizeCases: "X v. Y"', () => {
  it('italicizes one-word parties and leaves the rest of the sentence alone', () => {
    expect(italicizeCases('<p>The court in Rice v. Clark set the test.</p>')).toBe(
      '<p>The court in <em>Rice v. Clark</em> set the test.</p>',
    );
  });

  it('takes multi-word parties, "of", "&amp;", and hyphens', () => {
    expect(
      italicizeCases(
        '<p>Wells Fargo Bank v. Superior Court; Gilmaker v. Bank of America; ' +
          'Levin v. Winston-Levin; Smith &amp; Jones Co. v. Ukkestad Asset Finance Inc.</p>',
      ),
    ).toBe(
      '<p><em>Wells Fargo Bank v. Superior Court</em>; <em>Gilmaker v. Bank of America</em>; ' +
        '<em>Levin v. Winston-Levin</em>; <em>Smith &amp; Jones Co. v. Ukkestad Asset Finance Inc.</em></p>',
    );
  });

  it('stops at a period, comma, paren, or lowercase word after the second party', () => {
    expect(
      italicizeCases(
        '<p>(Doolittle v. Exchange Bank). Keading v. Keading. And Rice v. Clark, a</p>',
      ),
    ).toBe(
      '<p>(<em>Doolittle v. Exchange Bank</em>). <em>Keading v. Keading</em>. And <em>Rice v. Clark</em>, a</p>',
    );
    expect(italicizeCases('<p>Meiri v. Shamtoubi held that</p>')).toBe(
      '<p><em>Meiri v. Shamtoubi</em> held that</p>',
    );
  });

  it('leaves a sentence-lead word ("In", "Under", "See") outside the italics', () => {
    expect(italicizeCases('<p>In Rice v. Clark the court held. Under Rice v. Clark too.</p>')).toBe(
      '<p>In <em>Rice v. Clark</em> the court held. Under <em>Rice v. Clark</em> too.</p>',
    );
    expect(italicizeCases('<p>See Bernard v. Foley; compare Andersen v. Hunt.</p>')).toBe(
      '<p>See <em>Bernard v. Foley</em>; compare <em>Andersen v. Hunt</em>.</p>',
    );
  });

  it('keeps a trailing possessive and a reporter cite outside the italics', () => {
    expect(
      italicizeCases("<p>Rice v. Clark's test. Andersen v. Hunt (2011) 196 Cal.App.4th 722.</p>"),
    ).toBe(
      "<p><em>Rice v. Clark</em>'s test. <em>Andersen v. Hunt</em> (2011) 196 Cal.App.4th 722.</p>",
    );
  });

  it('keeps two cases joined by "and" apart', () => {
    expect(italicizeCases('<p>Rice v. Clark and Bernard v. Foley agree.</p>')).toBe(
      '<p><em>Rice v. Clark</em> and <em>Bernard v. Foley</em> agree.</p>',
    );
  });

  it('italicizes a hypothetical too', () => {
    expect(italicizeCases('<p>Think Trustee v. Beneficiary.</p>')).toBe(
      '<p>Think <em>Trustee v. Beneficiary</em>.</p>',
    );
  });
});

describe('italicizeCases: "Estate of", "In re", "Conservatorship of"', () => {
  it('italicizes the name and up to three words after it', () => {
    expect(
      italicizeCases(
        '<p>Estate of Heggstad, Estate of Yool, Conservatorship of Lefkowitz, ' +
          'In re Marriage of Greenway the court, Marriage of Smith Jones, In re Estate of Gump.</p>',
      ),
    ).toBe(
      '<p><em>Estate of Heggstad</em>, <em>Estate of Yool</em>, <em>Conservatorship of Lefkowitz</em>, ' +
        '<em>In re Marriage of Greenway</em> the court, <em>Marriage of Smith Jones</em>, <em>In re Estate of Gump</em>.</p>',
    );
  });

  it('works mid-sentence and stops at a period', () => {
    expect(
      italicizeCases('<p>the rule in In re Barr applies. Conservatorship of Ribal. Take</p>'),
    ).toBe(
      '<p>the rule in <em>In re Barr</em> applies. <em>Conservatorship of Ribal</em>. Take</p>',
    );
  });

  it('leaves lowercase "estate of" and a bare surname alone', () => {
    const html = '<p>the estate of Mom, a Heggstad petition, and Estate of the</p>';
    expect(italicizeCases(html)).toBe(html);
  });

  it('lets "Estate of X v. Y" read as one case', () => {
    expect(italicizeCases('<p>Estate of Smith v. Jones held.</p>')).toBe(
      '<p><em>Estate of Smith v. Jones</em> held.</p>',
    );
  });
});

describe('italicizeCases: HTML safety', () => {
  it('skips headings, links, code, and text already in em or i', () => {
    const html =
      '<h2 id="rice">The Rice v. Clark way</h2><h3>Estate of Heggstad</h3>' +
      '<p><a href="/x/">Rice v. Clark</a> <em>Rice v. Clark</em> <i>Rice v. Clark</i> <code>Rice v. Clark</code></p>';
    expect(italicizeCases(html)).toBe(html);
  });

  it('ignores a case name inside an attribute and italicizes inside bold', () => {
    expect(italicizeCases('<p><img alt="Rice v. Clark" /><strong>Rice v. Clark</strong></p>')).toBe(
      '<p><img alt="Rice v. Clark" /><strong><em>Rice v. Clark</em></strong></p>',
    );
  });

  it('is idempotent and never produces an em dash', () => {
    const once = italicizeCases('<p>In Rice v. Clark and Estate of Heggstad – both.</p>');
    expect(italicizeCases(once)).toBe(once);
    expect(once).not.toContain('\u2014');
  });
});
