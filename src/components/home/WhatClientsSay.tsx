import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { asset } from '@/config/site';
import { testimonialDisclaimer, testimonials, type Testimonial } from '@/config/testimonials';

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col border border-line border-l-4 border-l-brass-400 bg-white p-6">
      <blockquote className="flex-1 font-serif-italic text-lead italic text-ink">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.photo ? (
          <Image
            src={asset(t.photo)}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-cover"
          />
        ) : (
          <InitialAvatar name={t.name} size="sm" className="h-12 w-12" />
        )}
        <span>
          <span className="block text-small font-semibold text-ink">{t.name}</span>
          <span className="block text-meta text-ink-3">{t.relationship}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * HOMEPAGE-SPEC §6: three verbatim quotes; the CRPC disclaimer lives in the same
 * component. The firm publishes no results, so nothing here is called one
 * (Arthur, 2026-09-02).
 */
export function WhatClientsSay() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow="What clients say"
          title="After the dust settles, this is what they tell us."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
        <p className="mt-6 max-w-[70ch] text-small text-ink-3">{testimonialDisclaimer}</p>
      </Container>
    </section>
  );
}
