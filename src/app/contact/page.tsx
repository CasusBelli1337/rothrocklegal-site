import type { Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection';
import { PageTitleBand } from '@/components/PageTitleBand';
import { PinIcon } from '@/components/icons';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Rothrock Legal — Silicon Valley, California. Call (408) 420-7034 or email ' +
    'arothrock@rothrocklegal.com to schedule a consultation.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <PageTitleBand title="Contact Us" />
      <ContactSection />
      {/* The Wix page embedded a Google map pinned on San Francisco — replaced
          with a clean location band (see CHANGES.md). */}
      <section className="hex-band px-6 py-12 text-center text-white">
        <PinIcon className="mx-auto h-8 w-8 text-gold" />
        <p className="font-serif-accent mt-3 text-2xl">{site.location}</p>
        <p className="mt-2 text-sm text-white/85">
          Serving clients throughout the San Francisco Bay Area and beyond.
        </p>
      </section>
    </>
  );
}
