import Image from 'next/image';
import { asset } from '@/config/site';

interface LeadBullet {
  lead: string;
  rest: string;
}

const experience: LeadBullet[] = [
  {
    lead: 'Founder of Rothrock Legal,',
    rest:
      ' a law firm concentrating on business litigation, trust and estate litigation, and elder ' +
      'abuse litigation, pioneering a groundbreaking hybrid business model that combines hourly ' +
      'billing with a cost-per-page approach',
  },
  {
    lead: 'CEO and Co-Founder of Legion,',
    rest:
      ' an AI legal tech company that develops cutting-edge tools like an AI litigator that ' +
      'auto-drafts litigation documents, freeing up attorneys to focus on high-value, ' +
      'substantive work',
  },
  {
    lead: 'Obtained numerous multi-million-dollar settlements',
    rest:
      ' on behalf of clients in cases concerning undue influence, breach of fiduciary duty, and ' +
      'financial elder abuse',
  },
  {
    lead: 'Successfully represented clients in complex,',
    rest:
      ' high-stakes litigation concerning trust, estate, intellectual property, and business ' +
      'litigation matters in both state and federal court',
  },
];

export function ArthurCV() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-14">
      <h2 className="font-heading text-3xl font-semibold text-navy">Experience</h2>
      <ul className="mt-6 space-y-3">
        {experience.map((item) => (
          <li key={item.lead} className="flex gap-2 text-[15px] leading-relaxed">
            <span aria-hidden="true" className="text-gold">
              •
            </span>
            <span>
              <span className="font-bold text-gold">{item.lead}</span>
              {item.rest}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="bg-maroon-band p-8 text-white lg:w-3/5">
          <h3 className="text-lg font-bold text-gold">Professional Activities</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>Honorable William A. Ingram Inn of Court, Barrister (2019-present)</li>
            <li>Silicon Valley Bar Association, Member</li>
            <li>Santa Clara County Bar Association, Member</li>
          </ul>
          <h3 className="mt-8 text-lg font-bold text-gold">Recognitions and Awards</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>Northern California Super Lawyers&reg; - &quot;Rising Star&quot; (2020-2025)</li>
            <li>Best Lawyers&reg; - &quot;Ones to Watch&quot; (2024-2025)</li>
          </ul>
        </div>
        <div className="relative lg:w-2/5">
          <div className="absolute -top-3 -right-3 h-full w-full border border-gold" aria-hidden="true" />
          <Image
            src={asset('/images/ai-robot-scales.webp')}
            alt="Robotic hand presenting scales of justice on a screen"
            width={422}
            height={282}
            className="relative w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-12 border border-gold/40 bg-[#FDF6E7] p-8">
        <h3 className="text-lg font-bold text-navy">
          Artificial Intelligence &amp; Legal Tech Experience
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed font-semibold">
          Arthur is a sought-after speaker and thought leader in the field of AI and its
          applications in legal practice. He has been invited to share his expertise at various
          events, including at the Monterey College of Law. Arthur is passionate about educating
          the legal community on the effective use of AI in legal work and is regularly invited to
          speak at industry conferences, webinars, and seminars.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed">
          As a recognized authority in the field, Arthur actively contributes to AI-focused online
          communities and shares his insights on Legion. law. The website serves as a platform for
          Arthur to advise the legal community on generative AI, comment on AI developments in law,
          and provide valuable resources for legal professionals looking to integrate AI into their
          practice.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed">
          If you are interested in having Arthur speak at your event or would like to learn more
          about how AI can revolutionize your legal practice, please don&apos;t hesitate to reach
          out to him at{' '}
          <a href="mailto:arthur@legion.law" className="text-maroon-band underline">
            arthur@legion.law
          </a>
          .
        </p>
      </div>

      <h3 className="mt-10 text-base font-bold text-black">Personal Interests</h3>
      <p className="mt-3 text-[15px] leading-relaxed">
        When not innovating legal tech solutions or advocating for his clients, Arthur is an avid
        traveler, having explored Russia, Mongolia, China, Colombia, Chile, Costa Rica, Mexico,
        Spain, Morocco, the Bahamas, and the Caribbean. He is also a PADI Advanced Open Water SCUBA
        Diver, a 2nd Degree Black Belt in Eagle Claw Kung Fu, and enjoys designing and 3D printing
        various items.
      </p>
    </section>
  );
}
