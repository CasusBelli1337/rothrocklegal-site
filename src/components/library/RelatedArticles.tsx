import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { LibraryListItem } from '@/lib/library/index-item';
import { LibraryCard } from './LibraryCard';

/** Up to three related cards after the article body (LIBRARY-SPEC §6.3). */
export function RelatedArticles({ items }: { items: readonly LibraryListItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="bg-sand py-12 lg:py-16" aria-labelledby="related-heading">
      <Container>
        <SectionHeading eyebrow="Related" title="Keep reading." id="related-heading" />
        <Reveal stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => (
            <LibraryCard key={item.slug} item={item} headingLevel="h3" />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
