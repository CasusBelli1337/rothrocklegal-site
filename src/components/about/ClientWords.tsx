import Image from 'next/image';
import { QuoteIcon } from '@/components/icons';
import { Container } from '@/components/ui/Container';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { asset } from '@/config/site';
import { testimonialDisclaimer, testimonials, type Testimonial } from '@/config/testimonials';

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex flex-col rounded-xl border border-line bg-white p-6">
      <QuoteIcon className="h-6 w-6 text-brass-500" />
      <blockquote className="mt-4 flex-1 font-serif text-lead text-ink italic">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
          {t.photo ? (
            <Image
              src={asset(t.photo)}
              alt={`${t.name}, a Rothrock Legal client`}
              width={96}
              height={96}
              sizes="48px"
              className="h-full w-full object-cover"
            />
          ) : (
            <InitialAvatar name={t.name} size="sm" className="h-full w-full" />
          )}
        </div>
        <div>
          <p className="font-sans text-body font-semibold text-ink">{t.name}</p>
          <p className="text-meta text-ink-3">{t.relationship}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** The three client quotes, verbatim, with the CRPC 7.1 disclaimer on every render (HOMEPAGE-SPEC §6). */
export function ClientWords() {
  return (
    <section className="bg-sand py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Client words" title="What clients say after the dust settles." />
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Reveal>
        <p className="mt-6 max-w-[70ch] text-small text-ink-3">{testimonialDisclaimer}</p>
      </Container>
    </section>
  );
}
