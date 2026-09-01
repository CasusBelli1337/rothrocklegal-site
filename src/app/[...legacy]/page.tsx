import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { legacyRedirects, relativeTarget } from '@/config/redirects';
import { site } from '@/config/site';

interface Params {
  legacy: string[];
}

export function generateStaticParams(): Params[] {
  const keys = Object.keys(legacyRedirects);
  console.log(`redirect stubs: ${keys.length}`);
  return keys.map((path) => ({ legacy: path.split('/') }));
}

function entryFor(legacy: string[]) {
  const entry = legacyRedirects[legacy.join('/')];
  if (!entry) throw new Error(`No redirect for /${legacy.join('/')}/`);
  return entry;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { legacy } = await params;
  const entry = entryFor(legacy);
  return {
    title: `${entry.label} (moved)`,
    description: `This page has moved to ${site.canonicalHost}${entry.to}`,
    alternates: { canonical: entry.to },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyRedirectPage({ params }: { params: Promise<Params> }) {
  const { legacy } = await params;
  const path = legacy.join('/');
  const entry = entryFor(legacy);
  return (
    <RedirectStub
      relativeTarget={relativeTarget(path, entry.to)}
      href={entry.to}
      label={entry.label}
    />
  );
}
