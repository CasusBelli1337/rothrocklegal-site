import { renderVariants, Slot } from '@/components/lens/Slot';
import { LibraryCard } from '@/components/library/LibraryCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { lensConfig } from '@/config/lens';
import { lensCopy } from '@/config/lens-copy';
import { getLibraryPreview } from '@/lib/library/preview';
import type { LibraryListItem } from '@/lib/library/index-item';
import { LENSES, type Lens, type LensCopy } from '@/lib/lens/types';

const PREVIEW_SIZE = 3;

/** One list per lens (docs/LENS.md §4e); a lens with nothing in its categories shows the neutral picks. */
function previewLists(): LensCopy<LibraryListItem[]> {
  const pick = (lens: Lens) =>
    getLibraryPreview(PREVIEW_SIZE, {
      categories: lensConfig.previewCategories[lens],
      pinned: lensConfig.previewPinned[lens],
    });
  const neutral = pick('neutral');
  const orNeutral = (items: LibraryListItem[]) => (items.length > 0 ? items : neutral);
  return {
    neutral,
    trustee: orNeutral(pick('trustee')),
    beneficiary: orNeutral(pick('beneficiary')),
  };
}

/**
 * HOMEPAGE-SPEC §7: the 3 newest articles, never Technology & the Law; the
 * trustee and beneficiary lenses get their own three. Drafts appear with
 * their chip while `site.showDraftArticles` is on.
 */
export function LibraryPreview() {
  const lists = previewLists();
  const keys = { neutral: '', trustee: '', beneficiary: '' };
  const byKey = new Map<string, LibraryListItem[]>();
  for (const lens of LENSES) {
    keys[lens] = lists[lens].map((item) => item.slug).join(',');
    byKey.set(keys[lens], lists[lens]);
  }
  console.log(
    `homepage library preview: ${LENSES.map((l) => `${l} ${lists[l].length}`).join(', ')} item(s)`,
  );
  const grids = renderVariants(keys, (key) => (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {(byKey.get(key) ?? []).map((item) => (
        <LibraryCard key={item.slug} item={item} />
      ))}
    </div>
  ));
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="From the library"
            title="Answers to common questions."
            lead={<Slot name="library-lead" variants={lensCopy.libraryLead} />}
          />
          <Button variant="secondary" href="/library/" className="shrink-0">
            Browse the library
          </Button>
        </div>
        {lists.neutral.length > 0 && <Slot name="library-preview" as="div" variants={grids} />}
      </Container>
    </section>
  );
}
