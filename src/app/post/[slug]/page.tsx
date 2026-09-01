import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { relativeTarget } from '@/config/redirects';
import { getArticles } from '@/lib/library/articles';

interface Params {
  slug: string;
}

interface Target {
  slug: string;
  to: string;
  label: string;
}

const EXPECTED_LEGACY = 9;

/**
 * Pure stub route (IA.md §4b–c): every legacy post slug and its old Wix slug
 * exports as a meta-refresh stub into the library, so no live link 404s.
 */
function targets(): Target[] {
  const legacy = getArticles().filter((a) => a.oldSlug !== undefined);
  if (legacy.length !== EXPECTED_LEGACY) {
    throw new Error(
      `Expected ${EXPECTED_LEGACY} legacy library posts with oldSlug, found ${legacy.length}`,
    );
  }
  return legacy.flatMap((a) => {
    const to = `/library/${a.slug}/`;
    const old = a.oldSlug ?? a.slug;
    return [
      { slug: a.slug, to, label: a.title },
      { slug: old, to, label: a.title },
    ];
  });
}

function findTarget(slug: string): Target {
  const target = targets().find((t) => t.slug === slug);
  if (!target) throw new Error(`No legacy post stub for "${slug}"`);
  return target;
}

export function generateStaticParams(): Params[] {
  return targets().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const target = findTarget(slug);
  return {
    title: `${target.label} (moved)`,
    alternates: { canonical: target.to },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const target = findTarget(slug);
  return (
    <RedirectStub
      relativeTarget={relativeTarget(`post/${slug}`, target.to)}
      href={target.to}
      label={target.label}
    />
  );
}
