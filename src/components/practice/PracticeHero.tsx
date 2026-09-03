import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { practiceHub, type PracticeArea } from '@/config/practice-areas';
import { consultCta, noteCta } from '@/config/site';
import { getTeamMember, teamHref } from '@/config/team';
import { formatDate } from '@/lib/format-date';
import { bindSectionSigns, keepCompounds } from '@/lib/typography';
import type { Crumb } from '@/types/content';

/** Trail per IA.md §6. */
export function practiceTrail(area: PracticeArea): Crumb[] {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }];
  if (!area.hub) trail.push({ label: practiceHub.title, href: `/${practiceHub.slug}/` });
  trail.push({ label: area.title });
  return trail;
}

/** Paper hero: breadcrumb, eyebrow, problem headline, answer-first lead, byline, CTAs. */
export function PracticeHero({ area }: { area: PracticeArea }) {
  const author = getTeamMember(area.author);
  return (
    <section className="border-b border-line bg-white">
      <Container className="py-10 lg:py-16">
        <Breadcrumbs trail={practiceTrail(area)} />
        <div className="mt-8 max-w-[52rem]">
          <Eyebrow rule>{area.hub ? 'Practice areas' : practiceHub.title}</Eyebrow>
          <h1 className="mt-4 font-serif text-h1 text-ink">{keepCompounds(area.headline)}</h1>
          <p className="mt-6 text-lead text-ink-2">{bindSectionSigns(area.summary)}</p>
          <p className="mt-5 text-meta text-ink-3">
            By{' '}
            <Link
              href={teamHref(author)}
              className="tap-link text-ink underline underline-offset-3 hover:text-maroon-700"
            >
              {author.name}
            </Link>{' '}
            &middot; Updated {formatDate(area.updatedAt)}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={consultCta.href}>{consultCta.label}</Button>
            <Button variant="secondary" href={noteCta.href}>
              {noteCta.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
