import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { relativeTarget } from '@/config/redirects';

const TO = '/library/intellectual-property-considerations/';

/** Retired: the same essay already exists as a library post (IA.md §4b). */
export const metadata: Metadata = {
  title: 'Intellectual Property Considerations (moved)',
  alternates: { canonical: TO },
  robots: { index: false, follow: true },
};

export default function IpConsiderationsPage() {
  return (
    <RedirectStub
      relativeTarget={relativeTarget('ip-considerations', TO)}
      href={TO}
      label="Intellectual Property Considerations"
    />
  );
}
