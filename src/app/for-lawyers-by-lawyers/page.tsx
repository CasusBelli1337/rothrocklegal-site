import type { Metadata } from 'next';
import Link from 'next/link';
import { WhatIsAiBand } from '@/components/lawyers/WhatIsAiBand';
import { AiLiability, LegalLandscape } from '@/components/lawyers/LawyersArticles';

export const metadata: Metadata = {
  title: 'For Lawyers, By Lawyers',
  description:
    'Practical experiences, primers, and more for attorneys — what AI is, AI liability, and the ' +
    'legal landscape of AI commercial transactions.',
  alternates: { canonical: '/for-lawyers-by-lawyers/' },
};

export default function ForLawyersPage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-10">
        <h1 className="font-heading text-4xl font-light text-navy sm:text-5xl">
          FOR LAWYERS, BY LAWYERS
        </h1>
        <p className="mt-4 font-heading text-xl text-navy-light">
          Practical experiences, primers, and more for attorneys.
        </p>
      </div>
      <WhatIsAiBand />
      <AiLiability />
      <LegalLandscape />
      <section className="bg-panel px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl text-navy">Keep exploring</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link
              href="/ai-glossary/"
              className="border border-maroon-band bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-semibold text-maroon-band">AI Glossary</h3>
              <p className="mt-2 text-sm text-navy-light">
                A comprehensive reference of common AI terms and their meaning, compiled for
                attorneys.
              </p>
            </Link>
            <Link
              href="/ip-considerations/"
              className="border border-maroon-band bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-semibold text-maroon-band">
                Intellectual Property Considerations
              </h3>
              <p className="mt-2 text-sm text-navy-light">
                Protecting AI innovations through patents, copyright, and trade secrets.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
