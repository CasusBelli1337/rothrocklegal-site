import Image from 'next/image';
import { CollageWithTab } from '@/components/home/WhoWeAre';
import { BulbIcon, PeopleIcon, QuoteIcon, ScalesIcon } from '@/components/icons';
import { asset } from '@/config/site';

const traits = [
  {
    icon: <BulbIcon className="h-6 w-6" />,
    title: 'Innovation in Legal Practice',
    body: 'Redefining law with AI and advanced technologies.',
  },
  {
    icon: <ScalesIcon className="h-6 w-6" />,
    title: 'Expertise in Technology Law',
    body: 'Deep industry knowledge, Silicon Valley experience.',
  },
  {
    icon: <PeopleIcon className="h-6 w-6" />,
    title: 'Client-Centric Approach',
    body: 'Personalized, strategic legal advice.',
  },
];

export function AboutIntro() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-16 lg:flex-row">
      <CollageWithTab />
      <div className="max-w-xl">
        <p className="eyebrow">Who We Are</p>
        <h2 className="font-serif-accent mt-2 text-3xl font-bold text-maroon-band">
          About Rothrock Legal
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed">
          At Rothrock Legal, we redefine legal practice through innovation and expertise in
          technology law. Founded by Arthur E. Rothrock, our firm combines deep industry knowledge
          with a commitment to client success. Leveraging AI and advanced legal technologies, we
          offer tailored solutions for the complex needs of our clients.
        </p>
        <div className="mt-8 space-y-5">
          {traits.map((trait) => (
            <div key={trait.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-maroon-btn border-b-4 text-maroon-btn">
                {trait.icon}
              </div>
              <div>
                <p className="text-[15px] font-bold text-maroon-band">{trait.title}</p>
                <p className="text-sm text-navy-light">{trait.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FounderBlock() {
  return (
    <section className="bg-panel px-6 py-16">
      <h2 className="text-center font-heading text-3xl font-medium tracking-[0.25em] text-gold">
        ARTHUR E. ROTHROCK
      </h2>
      <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-0 lg:flex-row">
        <div className="relative z-10 bg-maroon-band p-8 text-white lg:w-3/5 lg:p-12">
          <p className="text-sm font-bold text-gold">
            Founder of Rothrock Legal | CEO &amp; Co-Founder of Legion
          </p>
          <p className="mt-5 text-[17px] leading-relaxed">
            Arthur Rothrock is a visionary legal tech entrepreneur and seasoned attorney, dedicated
            to disrupting the legal industry through the power of artificial intelligence. As the
            founder of Rothrock Legal, and the CEO and co-founder of Legion, an AI legal tech
            company, Arthur is at the forefront of leveraging technology to improve access to
            justice for all while providing exceptional legal services to his clients.
          </p>
          <figure className="mt-8 flex gap-4 bg-white p-5 text-black">
            <QuoteIcon className="h-8 w-8 shrink-0 text-gold" />
            <div>
              <blockquote className="text-sm leading-relaxed">
                &quot;My mission is to empower both attorneys and clients with innovative AI tools
                and top-tier legal representation. By streamlining the legal process and enhancing
                the quality of our work, we can provide more affordable and accessible legal
                services to those in need.&quot;
              </blockquote>
              <figcaption className="mt-1 text-sm text-gold">- Arthur Rothrock</figcaption>
            </div>
          </figure>
        </div>
        <div className="-mt-6 bg-white p-3 shadow-xl lg:-ml-8 lg:mt-0">
          <Image
            src={asset('/images/arthur-headshot.webp')}
            alt="Arthur E. Rothrock"
            width={400}
            height={372}
          />
        </div>
      </div>
    </section>
  );
}
