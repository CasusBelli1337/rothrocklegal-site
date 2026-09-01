import type { Metadata } from 'next';
import { RedirectStub } from '@/components/RedirectStub';
import { relativeTarget } from '@/config/redirects';

const TO = '/library/ai-glossary/';

/** Retired: the glossary is a library entry (IA.md §4b). */
export const metadata: Metadata = {
  title: 'AI Glossary for Lawyers and Clients (moved)',
  alternates: { canonical: TO },
  robots: { index: false, follow: true },
};

export default function AiGlossaryPage() {
  return (
    <RedirectStub
      relativeTarget={relativeTarget('ai-glossary', TO)}
      href={TO}
      label="AI Glossary for Lawyers and Clients"
    />
  );
}
