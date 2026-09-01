import { LibraryCard } from '@/components/library/LibraryCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { PracticeArea } from '@/config/practice-areas';
import { getLibraryPreview } from '@/lib/library/preview';

/** Up to 4 library articles in the page's categories (LIBRARY-SPEC §8). Renders nothing when empty. */
export function RelatedReading({ area }: { area: PracticeArea }) {
  const items = getLibraryPreview(4, { categories: area.categories });
  if (items.length === 0) return null;
  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="related-reading">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="related-reading"
            eyebrow="Related reading"
            title="Read more before you call."
          />
          <Button variant="secondary" href="/library/" className="shrink-0">
            Browse the library
          </Button>
        </Reveal>
        <Reveal
          stagger
          className={`mt-10 grid gap-5 md:grid-cols-2 ${items.length >= 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}
        >
          {items.map((item) => (
            <LibraryCard key={item.slug} item={item} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
