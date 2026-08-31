import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Rothrock Legal — how we leverage AI technology, what sets ' +
    'us apart, how to get started, and how Legion relates to the firm.',
  alternates: { canonical: '/faq/' },
};

/* Q&A pairing follows the corrected reading order verified against the live
 * site's screenshots (the Wix DOM emitted them out of order). */
const faqs = [
  {
    question: 'How does Rothrock Legal leverage AI technology?',
    answer:
      'We utilize cutting-edge AI tools to streamline document drafting, legal research, and ' +
      'case management, allowing us to provide efficient and cost-effective services to our ' +
      'clients.',
  },
  {
    question: 'What sets Rothrock Legal apart from other law firms?',
    answer:
      'Our unique combination of legal expertise, technological innovation, and a client-centric ' +
      'approach enables us to deliver tailored solutions that address your specific needs and ' +
      'goals.',
  },
  {
    question: 'How can I get started with Rothrock Legal?',
    answer:
      "Simply contact our office to schedule a consultation. We'll discuss your case, answer " +
      'your questions, and develop a customized strategy to help you move forward.',
  },
  {
    question: 'What is Legion and how does it relate to Rothrock Legal?',
    answer:
      'Legion is a cutting-edge AI legal technology company co-founded by Arthur E. Rothrock. ' +
      "Rothrock Legal leverages Legion's advanced tools to enhance our legal services and " +
      'provide our clients with a competitive edge.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-heading text-4xl font-light text-navy">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-8 border border-maroon-band/60 p-8 sm:p-10">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h2 className="text-xl font-bold text-gold">{faq.question}</h2>
            <p className="mt-2 pl-2 text-[15px] leading-relaxed text-navy-light">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
