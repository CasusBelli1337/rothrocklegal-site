import { describe, expect, it } from 'vitest';
import { extractHeadings, renderMarkdown, stripMarkdown } from './markdown';
import { slugifyHeading } from './markdown-inline';
import { extractFaq, searchableText, splitSections, withoutFaqBody } from './markdown-sections';

describe('renderMarkdown blocks', () => {
  it('renders h2/h3 with slug ids and de-duplicates repeats', () => {
    const html = renderMarkdown('## Key deadlines\n\n### Key deadlines\n\n## Key deadlines');
    expect(html).toContain('<h2 id="key-deadlines">Key deadlines</h2>');
    expect(html).toContain('<h3 id="key-deadlines-2">Key deadlines</h3>');
    expect(html).toContain('<h2 id="key-deadlines-3">Key deadlines</h2>');
  });

  it('joins consecutive lines into one paragraph and splits on blank lines', () => {
    expect(renderMarkdown('one\ntwo\n\nthree')).toBe('<p>one two</p>\n<p>three</p>');
  });

  it('renders unordered and ordered lists, nested one level', () => {
    const html = renderMarkdown('- a\n  - a1\n  - a2\n- b\n\n1. x\n2. y');
    expect(html).toBe(
      '<ul><li>a<ul><li>a1</li><li>a2</li></ul></li><li>b</li></ul>\n<ol><li>x</li><li>y</li></ol>',
    );
  });

  it('keeps indented continuation lines inside the list item', () => {
    expect(renderMarkdown('- a\n  more')).toBe('<ul><li>a<br />more</li></ul>');
  });

  it('keeps a loose list (items separated by blank lines) as one list', () => {
    expect(renderMarkdown('1. **File.** x\n\n2. **Serve.** y\n\n3. Trial')).toBe(
      '<ol><li><strong>File.</strong> x</li><li><strong>Serve.</strong> y</li><li>Trial</li></ol>',
    );
    expect(renderMarkdown('- a\n\n- b\n\nafter')).toBe(
      '<ul><li>a</li><li>b</li></ul>\n<p>after</p>',
    );
  });

  it('switches list type when the marker changes', () => {
    expect(renderMarkdown('- a\n1. b')).toBe('<ul><li>a</li></ul>\n<ol><li>b</li></ol>');
  });

  it('renders blockquotes with paragraphs', () => {
    expect(renderMarkdown('> first\n> line\n>\n> second')).toBe(
      '<blockquote><p>first line</p><p>second</p></blockquote>',
    );
  });

  it('renders simple pipe tables inside a scroll wrapper', () => {
    const html = renderMarkdown('| A | B |\n| --- | :-: |\n| 1 | **2** |');
    expect(html).toBe(
      '<div class="table-wrap"><table><thead><tr><th>A</th><th>B</th></tr></thead>' +
        '<tbody><tr><td>1</td><td><strong>2</strong></td></tr></tbody></table></div>',
    );
  });

  it('fails loudly on a table without a separator row', () => {
    expect(() => renderMarkdown('| A | B |\n| 1 | 2 |')).toThrow(/Malformed table/);
  });

  it('renders horizontal rules', () => {
    expect(renderMarkdown('a\n\n---\n\nb')).toBe('<p>a</p>\n<hr />\n<p>b</p>');
  });

  it('ends a table when a paragraph follows without a blank line', () => {
    const html = renderMarkdown('| A |\n| - |\n| 1 |\nafter');
    expect(html).toContain('</table></div>\n<p>after</p>');
  });
});

describe('renderMarkdown inline', () => {
  it('escapes HTML', () => {
    expect(renderMarkdown('a <b> & c')).toBe('<p>a &lt;b&gt; &amp; c</p>');
  });

  it('renders bold, italic, and code', () => {
    expect(renderMarkdown('**bold** *it* `x<y`')).toBe(
      '<p><strong>bold</strong> <em>it</em> <code>x&lt;y</code></p>',
    );
  });

  it('does not treat inline asterisks inside words as emphasis', () => {
    expect(renderMarkdown('2*3*4')).toBe('<p>2*3*4</p>');
  });

  it('renders external links with rel=noopener and internal links with the prefix', () => {
    const html = renderMarkdown('[a](https://x.test/) [b](/contact/) [c](#faq)', {
      linkPrefix: '/_preview',
    });
    expect(html).toBe(
      '<p><a href="https://x.test/" rel="noopener">a</a> <a href="/_preview/contact/">b</a> <a href="#faq">c</a></p>',
    );
  });

  it('allows bold inside link text', () => {
    expect(renderMarkdown('[**x**](/y/)')).toBe('<p><a href="/y/"><strong>x</strong></a></p>');
  });
});

describe('extractors', () => {
  const doc = [
    'Intro *here*.',
    '',
    '## How long? (Probate Code § 16061.8)',
    '',
    'Body with [a link](/x/).',
    '',
    '### Sub',
    '',
    '## Frequently asked questions',
    '',
    '### Does it start on mailing?',
    '',
    'Yes, **on deposit** (Probate Code § 1215).',
    'Second line.',
    '',
    '### Can I wait?',
    '',
    'No.',
    '',
    '## Talk to a trust litigation lawyer in San Jose',
    '',
    'Call us. This article is general information.',
  ].join('\n');

  it('slugifies headings', () => {
    expect(slugifyHeading('Undue Influence & Capacity?')).toBe('undue-influence-and-capacity');
    expect(slugifyHeading("Who's the trustee")).toBe('whos-the-trustee');
  });

  it('extracts headings with renderer-identical ids', () => {
    const headings = extractHeadings(doc);
    expect(headings.map((h) => [h.level, h.id])).toEqual([
      [2, 'how-long-probate-code-16061-8'],
      [3, 'sub'],
      [2, 'frequently-asked-questions'],
      [3, 'does-it-start-on-mailing'],
      [3, 'can-i-wait'],
      [2, 'talk-to-a-trust-litigation-lawyer-in-san-jose'],
    ]);
    expect(renderMarkdown(doc)).toContain('<h2 id="how-long-probate-code-16061-8">');
    expect(extractHeadings(withoutFaqBody(doc)).map((h) => h.id)).not.toContain('can-i-wait');
  });

  it('extracts FAQ items as plain text', () => {
    expect(extractFaq(doc)).toEqual([
      {
        question: 'Does it start on mailing?',
        answer: 'Yes, on deposit (Probate Code § 1215). Second line.',
      },
      { question: 'Can I wait?', answer: 'No.' },
    ]);
  });

  it('returns no FAQ items when the section is absent', () => {
    expect(extractFaq('## Other\n\ntext')).toEqual([]);
  });

  it('removes the FAQ body but keeps its heading and everything after', () => {
    const html = renderMarkdown(withoutFaqBody(doc));
    expect(html).toContain('<h2 id="frequently-asked-questions">Frequently asked questions</h2>');
    expect(html).not.toContain('Does it start');
    expect(html).toContain('<p>Call us.');
  });

  it('splits sections at ## boundaries only', () => {
    expect(splitSections(doc).map((s) => s.heading)).toEqual([
      null,
      'How long? (Probate Code § 16061.8)',
      'Frequently asked questions',
      'Talk to a trust litigation lawyer in San Jose',
    ]);
  });

  it('builds searchable text without FAQ, CTA, or markup', () => {
    const text = searchableText(doc);
    expect(text).toBe('Intro here. How long? (Probate Code § 16061.8) Body with a link. Sub');
  });

  it('strips tables, rules, and list markers to plain text', () => {
    expect(stripMarkdown('| A | B |\n| - | - |\n| 1 | 2 |\n\n---\n\n- item')).toBe('A B 1 2 item');
  });
});
