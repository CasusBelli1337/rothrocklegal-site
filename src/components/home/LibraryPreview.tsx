import { ArticleCard } from "@/components/library/ArticleCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLibraryPreview } from "@/lib/library/preview";

/** HOMEPAGE-SPEC §7: the 3 newest articles, never Technology & the Law. */
export function LibraryPreview() {
  const items = getLibraryPreview(3);
  console.log(`homepage library preview: ${items.length} item(s)`);
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="From the library"
            title="Answers to the questions people google at 2 a.m."
            lead="Deadlines, trust contests, trustees who won't account, elder financial abuse. Plain English, written by the lawyers who handle these cases."
          />
          <Button variant="secondary" href="/library/" className="shrink-0">
            Browse the library
          </Button>
        </Reveal>
        {items.length > 0 && (
          <Reveal stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {items.map((item) => (
              <ArticleCard key={item.slug} item={item} />
            ))}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
