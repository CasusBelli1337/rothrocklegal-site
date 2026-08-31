import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { legacyRedirects, relativeTarget } from '@/config/redirects';

interface Params {
  legacy: string[];
}

export function generateStaticParams(): Params[] {
  return Object.keys(legacyRedirects).map((path) => ({ legacy: path.split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { legacy } = await params;
  const entry = legacyRedirects[legacy.join('/')];
  return {
    title: `${entry.label} (moved)`,
    alternates: { canonical: entry.to },
  };
}

export default async function LegacyRedirectPage({ params }: { params: Promise<Params> }) {
  const { legacy } = await params;
  const path = legacy.join('/');
  const entry = legacyRedirects[path];
  return (
    <RedirectStub
      relativeTarget={relativeTarget(path, entry.to)}
      href={entry.to}
      label={entry.label}
    />
  );
}
