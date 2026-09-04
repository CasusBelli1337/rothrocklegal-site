import { describe, expect, it } from 'vitest';
import { enrichLegalCites, leginfoSectionHref } from './legal-cites';
import { getArticle } from './library/articles';
import { renderMarkdown } from './markdown';
import { getPracticeBody } from './practice';

describe('enrichLegalCites', () => {
  it('links the statute and italicizes the case in one paragraph, and is idempotent', () => {
    const html = enrichLegalCites(
      renderMarkdown(
        'The 120 days run from notice (Probate Code § 16061.8; Doolittle v. Exchange Bank).',
      ),
    );
    expect(html).toBe(
      `<p>The 120 days run from notice (Probate Code § <a href="${leginfoSectionHref('PROB', '16061.8')}" rel="noopener">16061.8</a>; ` +
        '<em>Doolittle v. Exchange Bank</em>).</p>',
    );
    expect(enrichLegalCites(html)).toBe(html);
  });

  it('leaves headings plain so TOC labels and ids are unchanged', () => {
    const html = enrichLegalCites(
      renderMarkdown('## Rice v. Clark and Probate Code § 850\n\ntext'),
    );
    expect(html).toBe(
      '<h2 id="rice-v-clark-and-probate-code-850">Rice v. Clark and Probate Code § 850</h2>\n<p>text</p>',
    );
  });
});

/** Integration over the real content tree. */
describe('the library and practice renderers run the cite passes', () => {
  const article = getArticle('how-to-contest-a-trust-in-california');

  it('links § 16061.8 to leginfo in the article body', () => {
    expect(article.bodyHtml).toContain(
      `<a href="${leginfoSectionHref('PROB', '16061.8')}" rel="noopener">16061.8</a>`,
    );
  });

  it('italicizes Doolittle v. Exchange Bank in the article body', () => {
    expect(article.bodyHtml).toContain('<em>Doolittle v. Exchange Bank</em>');
  });

  it('keeps the TOC, FAQ answers, and search text plain', () => {
    for (const entry of article.toc) expect(entry.text).not.toMatch(/<|leginfo/);
    for (const item of article.faq) expect(item.answer).not.toMatch(/<(a|em)\b/);
    expect(article.bodyText).not.toMatch(/<(a|em)\b|leginfo/);
  });

  it('links the statutes in a practice page section', () => {
    const html = getPracticeBody('trust-contests')
      .map((s) => s.html)
      .join('\n');
    expect(html).toContain('lawCode=PROB&amp;sectionNum=');
    expect(html).toContain('lawCode=WIC&amp;sectionNum=15610.70.');
    // Bare "section 850" has no code name in front of it and stays plain by design.
    expect(html).toContain('a section 850 petition');
  });
});
