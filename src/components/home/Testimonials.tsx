import Image from 'next/image';
import { InitialAvatar } from '@/components/InitialAvatar';
import { QuoteIcon } from '@/components/icons';
import { asset } from '@/config/site';

interface Testimonial {
  name: string;
  photo?: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Darius',
    photo: '/images/darius.webp',
    quote:
      'I had the pleasure of working with Arthur a few years back on a family estate matter and ' +
      "was impressed with my fellow Pennsylvanian's responsiveness, knowledge of the underlying " +
      "subject matter and diligence that led to a very positive result. Arthur doesn't let moss " +
      "grow on him when he's addressing your legal needs and you will be happy you engaged him!",
  },
  {
    name: 'Mark',
    quote:
      '"I wholeheartedly endorse Arthur. His keen mind, relentless determination, and ability ' +
      'to transition from a comforting ally to a fierce advocate make him an outstanding lawyer."',
  },
  {
    name: 'Tony',
    quote:
      '"Choosing Arthur was the wisest choice I made for my legal issue. His astute analysis, ' +
      'calming nature, and courageous representation, paired with his dedication to keeping me ' +
      'updated and composed, make him an indispensable resource for anyone aiming to achieve ' +
      'the most favorable result."',
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20">
      <h2 className="eyebrow text-center !text-base">TESTIMONIALS</h2>
      <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col items-center">
            <div className="border-2 border-gold p-2">
              <div className="relative h-40 w-40 overflow-hidden">
                {t.photo ? (
                  <Image
                    src={asset(t.photo)}
                    alt={`Photo of ${t.name}`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <InitialAvatar name={t.name} />
                )}
              </div>
            </div>
            <figcaption className="mt-4 font-heading text-xl text-gold">{t.name}</figcaption>
            <blockquote className="relative mt-4 bg-maroon-band p-6 pb-10 text-[13px] leading-relaxed text-white">
              <p className="font-quote">{t.quote}</p>
              <QuoteIcon className="absolute right-4 bottom-3 h-8 w-8 text-gold" />
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
