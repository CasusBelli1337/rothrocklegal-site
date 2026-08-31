import Image from 'next/image';
import Link from 'next/link';
import { asset } from '@/config/site';

interface ServiceCard {
  icon: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

/*
 * Card copy is verbatim from the Wix site, except the "Sevices" typo in the
 * first title is fixed to "Services" (see CHANGES.md).
 */
const cards: ServiceCard[] = [
  {
    icon: '/images/icon-service-business.png',
    title: 'Comprehensive Legal Services for your Needs',
    body:
      'Business Litigation Our experienced team handles various business disputes, from breach ' +
      'of contract to partnership disputes. We work tirelessly to protect your interests and ' +
      'achieve the best possible outcome.',
  },
  {
    icon: '/images/icon-service-trust.png',
    title: 'Trust & Estate Litigation',
    body:
      'We provide skilled representation in trust and estate litigation matters, including will ' +
      "contests, trust disputes, and undue influence cases. Our goal is to ensure your rights " +
      "are protected and your loved ones' wishes are honored.",
  },
  {
    icon: '/images/icon-service-elder.png',
    title: 'Elder Abuse Litigation',
    body:
      'Elder Abuse Litigation We are dedicated to protecting the rights of elderly individuals ' +
      'who have been victims of financial abuse or exploitation. Our compassionate team will ' +
      'fight for justice on your behalf and work to prevent further harm to yourself or elderly ' +
      'family members.',
  },
  {
    icon: '/images/icon-service-faq.png',
    title: 'Frequently Asked Questions',
    body:
      'How does Rothrock Legal leverage AI technology? We utilize cutting-edge AI tools to ' +
      'streamline document drafting, legal research, and case management, allowing us to provide ' +
      'efficient and cost-effective services to our clients.',
    cta: { label: 'Read More', href: '/faq/' },
  },
];

export function Services() {
  return (
    <section className="bg-panel px-6 py-20">
      <div className="text-center">
        <p className="eyebrow">Our Services</p>
        <h2 className="font-serif-accent mx-auto mt-2 max-w-md text-3xl font-bold text-black">
          AI Empowers Cutting-Edge Legal Services
        </h2>
      </div>
      <div className="mx-auto mt-16 grid max-w-4xl gap-x-10 gap-y-16 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="relative border border-maroon-band px-6 pt-12 pb-8">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-panel px-3">
              <Image src={asset(card.icon)} alt="" width={52} height={48} />
            </div>
            <h3 className="text-center font-heading text-lg font-semibold text-maroon-band">
              {card.title}
            </h3>
            <p className="mt-4 text-center text-sm leading-relaxed text-navy-light">{card.body}</p>
            {card.cta && (
              <div className="mt-6 text-center">
                <Link href={card.cta.href} className="btn-primary">
                  {card.cta.label}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
