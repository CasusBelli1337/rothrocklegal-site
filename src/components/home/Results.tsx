import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { asset } from '@/config/site';
import { testimonialDisclaimer, testimonials, type Testimonial } from '@/config/testimonials';

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-line bg-white p-6">
      <span
        aria-hidden="true"
        className="font-serif-italic text-5xl italic leading-none text-brass-400"
      >
        &ldquo;
      </span>
      <blockquote className="mt-2 flex-1 font-serif-italic text-lead italic text-ink">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.photo ? (
          <Image
            src={asset(t.photo)}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <InitialAvatar name={t.name} size="sm" className="h-12 w-12 rounded-full" />
        )}
        <span>
          <span className="block text-small font-semibold text-ink">{t.name}</span>
          <span className="block text-meta text-ink-3">{t.relationship}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** HOMEPAGE-SPEC §6: three verbatim quotes; the CRPC disclaimer lives in the same component. */
export function Results() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Results" title="What clients say after the dust settles." />
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Reveal>
        <p className="mt-6 max-w-[70ch] text-small text-ink-3">{testimonialDisclaimer}</p>
      </Container>
    </section>
  );
}
