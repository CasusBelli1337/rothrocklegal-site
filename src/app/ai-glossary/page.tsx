import type { Metadata } from 'next';
import { getGlossary } from '@/lib/glossary';

export const metadata: Metadata = {
  title: 'AI Terminology',
  description:
    'A comprehensive glossary of common AI terms and their meaning, compiled for attorneys and ' +
    'legal professionals by Rothrock Legal.',
  alternates: { canonical: '/ai-glossary/' },
};

export default function AiGlossaryPage() {
  const entries = getGlossary();
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-heading text-4xl font-light text-navy sm:text-5xl">AI Terminology</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-[#102E52]">
        Given that AI is a highly technical field, the amount of jargon can be daunting. For your
        ease of reference, I have compiled a comprehensive list of common terms and their meaning.
        Use CTRL+F to see if the term you&apos;re looking for appears below.
      </p>
      <dl className="mt-10 space-y-6">
        {entries.map((entry) => (
          <div key={entry.term}>
            <dt className="inline font-bold text-navy">{entry.term}: </dt>
            <dd className="inline text-[15px] leading-relaxed text-navy-light">
              {entry.definition}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
