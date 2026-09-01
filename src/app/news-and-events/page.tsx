import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { relativeTarget } from '@/config/redirects';

const TO = '/library/';

/** Retired: the posts live in the library (IA.md §4b). */
export const metadata: Metadata = {
  title: 'The Library (moved)',
  alternates: { canonical: TO },
  robots: { index: false, follow: true },
};

export default function NewsAndEventsPage() {
  return (
    <RedirectStub
      relativeTarget={relativeTarget('news-and-events', TO)}
      href={TO}
      label="The Library"
    />
  );
}
