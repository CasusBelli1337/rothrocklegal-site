import Link from 'next/link';
import { PhoneIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import {
  practiceHub,
  practicePages,
  practiceHref,
  type PracticeArea,
} from '@/config/practice-areas';
import { site } from '@/config/site';
import type { PracticeSection } from '@/lib/practice';

interface PracticeSidebarProps {
  area: PracticeArea;
  sections: readonly PracticeSection[];
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow font-sans">{children}</h2>;
}

/** Sticky aside: on this page, the statutes, other practice pages, and the phone. */
export function PracticeSidebar({ area, sections }: PracticeSidebarProps) {
  const others = practicePages.filter((p) => p.slug !== area.slug);
  return (
    <aside
      className="space-y-10 lg:col-span-4 lg:sticky lg:top-24 lg:self-start"
      aria-label="Page navigation and statutes"
    >
      <nav aria-labelledby="on-this-page">
        <SideHeading>On this page</SideHeading>
        <ol className="mt-4 space-y-2 border-l border-line">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px block border-l-2 border-transparent pl-4 text-small text-ink-2 hover:border-brass-400 hover:text-ink"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="rounded-xl border border-line bg-white p-5">
        <SideHeading>The statutes, in one line each</SideHeading>
        <dl className="mt-4 space-y-3">
          {area.statutes.map((statute) => (
            <div key={statute.cite}>
              <dt className="text-small font-semibold text-ink">{statute.cite}</dt>
              <dd className="text-small text-ink-2">{statute.plain}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl bg-maroon-700 p-5 text-white">
        <p className="font-serif text-h3">Worried about a deadline?</p>
        <p className="mt-2 text-small text-white/80">
          Two minutes of questions tell you which clocks are running.
        </p>
        <Button variant="inverse" size="sm" href="/how-long-do-i-have/" className="mt-4 w-full">
          Check my deadline
        </Button>
        <a
          href={site.phoneHref}
          className="mt-3 inline-flex items-center gap-2 text-small font-semibold text-white"
        >
          <PhoneIcon className="h-4 w-4" />
          {site.phone}
        </a>
      </div>

      <nav aria-labelledby="other-practice">
        <SideHeading>{area.hub ? 'Practice pages' : 'Other situations we handle'}</SideHeading>
        <ul className="mt-4 space-y-2">
          {!area.hub && (
            <li>
              <Link
                href={practiceHref(practiceHub)}
                className="text-small font-medium text-maroon-700 hover:text-maroon-600"
              >
                All trust &amp; estate litigation
              </Link>
            </li>
          )}
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={practiceHref(p)} className="text-small text-ink-2 hover:text-maroon-700">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
