import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/config/site';

export function Hero() {
  return (
    <section className="hex-band grid lg:grid-cols-2">
      <div className="flex items-center px-6 py-16 lg:py-24 lg:pl-24">
        <div className="relative max-w-md p-8">
          {/* thin white partial corner frame */}
          <div className="absolute top-0 left-0 h-full w-28 border-t border-b border-l border-white/80" />
          <div className="relative">
            <h1 className="font-serif-accent text-2xl font-bold text-white md:text-[1.75rem] md:leading-snug">
              Tech-Assisted Legal Services:
              <br />
              <span className="text-gold">Better Results, Lower Costs</span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-white">
              Discover how Rothrock Legal&apos;s AI-powered approach can revolutionize your case,
              delivering the results you need at a price you can afford. Take the first step towards
              a smarter, more efficient legal solution today.
            </p>
            <Link href="/about/" className="btn-outline mt-8 inline-block">
              Learn More
            </Link>
          </div>
        </div>
      </div>
      <div className="relative min-h-[320px] lg:min-h-[560px]">
        <Image
          src={asset('/images/hero-arthur.webp')}
          alt="Arthur E. Rothrock, founder of Rothrock Legal"
          fill
          priority
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}
