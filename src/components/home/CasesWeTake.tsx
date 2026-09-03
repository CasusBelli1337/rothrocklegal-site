import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { getPracticeBody } from '@/lib/practice';

const SOURCE_SLUG = 'complex-estates';
const SOURCE_HEADING = 'The matters Arthur has handled';

/**
 * The one paragraph on the site that describes the kinds of matters the firm
 * has handled, lifted at build time from content/practice/complex-estates.md
 * so it is written once (show, not tell; Arthur, 2026-09-02). The section's
 * second paragraph is the firm's no-results statement and stays attached.
 */
export function CasesWeTake() {
  const section = getPracticeBody(SOURCE_SLUG).find((s) => s.heading === SOURCE_HEADING);
  if (!section) {
    throw new Error(`content/practice/${SOURCE_SLUG}.md has no "## ${SOURCE_HEADING}" section`);
  }
  const [matters, ...disclaimer] = section.html.split(/(?<=<\/p>)/);
  if (!matters || disclaimer.length === 0) {
    throw new Error(`"${SOURCE_HEADING}" needs the matters paragraph and the no-results paragraph`);
  }
  return (
    <div className="rounded-xl border border-line bg-white p-6 lg:p-8">
      <h3 className="font-serif text-h3 text-ink">The cases we take</h3>
      <div
        className="mt-3 max-w-[70ch] text-body-lg text-ink-2 [&_p+p]:mt-4"
        dangerouslySetInnerHTML={{ __html: matters }}
      />
      <div
        className="mt-4 max-w-[70ch] text-small text-ink-3 [&_p+p]:mt-2"
        dangerouslySetInnerHTML={{ __html: disclaimer.join('') }}
      />
      <Link
        href={`/${SOURCE_SLUG}/`}
        className="tap-link mt-4 inline-flex items-center gap-2 text-ui font-semibold text-maroon-700 hover:text-maroon-600"
      >
        How we run a complex estate case
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
