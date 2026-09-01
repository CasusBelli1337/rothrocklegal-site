import { FaqAccordion } from '@/components/ui/FaqAccordion';
import type { LibraryArticle } from '@/lib/library/articles';

/**
 * Body prose, then the FAQ accordion (which emits FAQPage JSON-LD unless the
 * article is a draft), then the CTA + disclaimer outro; one markdown parse
 * feeds all three (LIBRARY-SPEC §6.2).
 */
export function ArticleBody({ article }: { article: LibraryArticle }) {
  return (
    <div>
      <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
      {article.faqHeading && article.faq.length > 0 && (
        <section aria-labelledby={article.faqHeading.id} className="mt-14">
          <h2 id={article.faqHeading.id} className="scroll-mt-[6.5rem] font-serif text-h2 text-ink">
            {article.faqHeading.text}
          </h2>
          <FaqAccordion
            items={article.faq}
            headingLevel="h3"
            jsonLd={!article.draft}
            className="mt-6"
          />
        </section>
      )}
      {article.outroHtml !== '' && (
        <div
          className="prose-article mt-14"
          dangerouslySetInnerHTML={{ __html: article.outroHtml }}
        />
      )}
    </div>
  );
}
