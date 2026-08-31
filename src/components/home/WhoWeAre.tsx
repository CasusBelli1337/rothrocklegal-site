import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/config/site';

/** Overlapping two-photo collage with the vertical maroon Read More tab. */
export function CollageWithTab() {
  return (
    <div className="relative mx-auto h-[420px] w-[330px] shrink-0">
      <div className="absolute top-6 right-0 h-40 w-24 border border-gold" aria-hidden="true" />
      <Image
        src={asset('/images/handshake.webp')}
        alt="Handshake over a work table"
        width={280}
        height={300}
        className="absolute top-0 left-0 h-[290px] w-[260px] object-cover"
      />
      <Link
        href="/about/"
        className="absolute top-16 right-4 z-10 bg-maroon-btn px-2 py-5 text-xs tracking-widest text-white [writing-mode:vertical-rl]"
      >
        Read More
      </Link>
      <Image
        src={asset('/images/collage-scales.webp')}
        alt="Scales weighing AI and human judgment"
        width={230}
        height={220}
        className="absolute right-6 bottom-0 h-[210px] w-[220px] border-4 border-white object-cover shadow-lg"
      />
    </div>
  );
}

export function WhoWeAre() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 lg:flex-row">
      <CollageWithTab />
      <div className="relative max-w-xl p-6">
        <div
          className="absolute top-0 right-0 h-full w-24 border-t border-r border-b border-maroon-band"
          aria-hidden="true"
        />
        <p className="eyebrow">Who We Are</p>
        <h2 className="font-serif-accent mt-2 text-3xl font-bold text-maroon-band">
          About Rothrock Legal
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed">
          At Rothrock Legal, we understand the unique challenge that litigation presents and will
          give you the confidence to handle it head on. Our founder, Arthur E. Rothrock, is not only
          an experienced litigator but also the Co-founder and CEO of Legion LegalTech, Corp. a
          groundbreaking AI legal technology company. Coming from one of the largest San Jose law
          firms, Arthur brings a wealth of knowledge to handling business disputes, elder abuse, and
          trust &amp; estate litigation matters.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed">
          With Rothrock Legal in your corner, you gain a powerful advantage – tireless
          representation through access to the leading edge of Legion&apos;s AI legal technology.
        </p>
      </div>
    </section>
  );
}
