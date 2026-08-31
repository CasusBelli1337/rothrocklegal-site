import Image from 'next/image';
import Link from 'next/link';
import {
  BriefcaseIcon,
  BulbIcon,
  DocCheckIcon,
  GearIcon,
  PeopleIcon,
  ScalesIcon,
} from '@/components/icons';
import { asset } from '@/config/site';

const reasons = [
  {
    icon: <BulbIcon className="h-6 w-6" />,
    title: 'Innovative AI Integration',
    body:
      'At Rothrock Legal, we leverage cutting-edge AI technology developed by Legion.law to ' +
      'enhance our legal services. Our AI tools streamline document drafting, legal research, ' +
      'and case analysis, providing unparalleled accuracy and efficiency.',
  },
  {
    icon: <ScalesIcon className="h-6 w-6" />,
    title: 'Comprehensive Legal Services',
    body:
      'From litigation support and legal consultation to intellectual property law and ' +
      'AI-assisted legal research, we offer a wide range of services to meet all your legal ' +
      'needs under one roof.',
  },
  {
    icon: <DocCheckIcon className="h-6 w-6" />,
    title: 'Proven Track Record',
    body:
      'With a track record of successful outcomes and satisfied clients, Rothrock Legal is a ' +
      'trusted partner for businesses and individuals seeking reliable and effective legal ' +
      'services.',
  },
  {
    icon: <GearIcon className="h-6 w-6" />,
    title: 'Cost-Effective Solutions',
    body:
      'We offer a hybrid billing model that combines hourly rates with per-page fees, ensuring ' +
      'transparency and cost savings for our clients. Our efficient processes further reduce ' +
      'costs without compromising on quality.',
  },
  {
    icon: <PeopleIcon className="h-6 w-6" />,
    title: 'Client-Centric Approach',
    body:
      "We prioritize our clients' needs and work closely with them to understand their unique " +
      'legal challenges. Our personalized approach ensures tailored solutions that meet and ' +
      'exceed client expectations.',
  },
  {
    icon: <BriefcaseIcon className="h-6 w-6" />,
    title: 'Expert Legal Team',
    body:
      'Our team consists of experienced legal professionals who are experts in their respective ' +
      'fields. We combine traditional legal expertise with innovative technology to deliver ' +
      'exceptional results for our clients.',
  },
];

export function WhyChoose() {
  return (
    <section className="hex-band px-6 pt-20 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Why Choose Us</p>
        <h2 className="font-serif-accent mt-2 text-3xl font-bold text-white">
          Why Choose Rothrock Legal?
        </h2>
        <div className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex items-start gap-5">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center border-b-2 border-gold bg-white p-3 text-maroon-btn">
                {reason.icon}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{reason.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Image
            src={asset('/images/scales-gavel-books.webp')}
            alt="Scales of justice, gavel, and law books"
            width={500}
            height={260}
            className="translate-y-6"
          />
        </div>
      </div>
    </section>
  );
}

/** Giant "TRY IT NOW" text filled with a crowd photo, over the DEMO button. */
export function TryItNow() {
  return (
    <section className="bg-white px-6 py-16 text-center">
      <h2
        className="inline-block bg-cover bg-center bg-clip-text font-heading text-[15vw] leading-none font-extrabold tracking-tight text-transparent sm:text-[8.5rem]"
        style={{ backgroundImage: `url(${asset('/images/crowd.webp')})` }}
      >
        TRY IT NOW
      </h2>
      <div className="mt-8">
        <Link href="/contact/" className="btn-primary inline-block">
          DEMO
        </Link>
      </div>
    </section>
  );
}
