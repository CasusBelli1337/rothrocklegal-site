import type { Metadata } from 'next';

export const metadata: Metadata = {
  // The live Wix title tag read "Intellectual Propert Considerations" — typo fixed.
  title: 'Intellectual Property Considerations',
  description:
    'The development and use of AI systems can raise a host of intellectual property issues — ' +
    'protecting AI innovations through patents, copyright, and trade secrets.',
  alternates: { canonical: '/ip-considerations/' },
};

const cards = [
  {
    title: 'Patents',
    tone: 'bg-maroon-band',
    body:
      'Certain AI innovations may be eligible for utility patent protection. The USPTO ' +
      'recognizes AI as a distinct category in its patent classification system and has ' +
      'examining units dedicated to AI applications. To be patentable, AI inventions must clear ' +
      'the subject matter eligibility hurdle under Section 101 of the Patent Act. Abstract ideas ' +
      '(like mathematical algorithms) are excluded from patent eligibility, so AI patent claims ' +
      'must be carefully drafted to emphasize technical improvements and practical applications. ' +
      'Disclosure requirements also pose challenges given the “black box” nature of many AI ' +
      'systems.',
  },
  {
    title: 'Copyright',
    tone: 'bg-[#38011F]',
    body:
      'Copyright can protect the original expression in AI source code and some visual/audio ' +
      'elements of AI-generated output. However, copyright does not extend to the functionality ' +
      'of the code itself. Copyright infringement also requires actual copying, which may be ' +
      'difficult to prove. Fair use defenses may apply to certain AI uses of copyrighted ' +
      'training data.',
  },
  {
    title: 'Trade Secrets',
    tone: 'bg-maroon-band',
    body:
      'Trade secret law can provide strong protection for AI source code, algorithms, and ' +
      'training datasets, as long as the owner takes reasonable steps to maintain secrecy. Trade ' +
      'secrets are protected under federal and state law and can last indefinitely. However, ' +
      'independent discovery is a defense to misappropriation.',
  },
];

export default function IpConsiderationsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[2fr_3fr]">
      <div>
        <h1 className="font-heading text-4xl font-light text-navy sm:text-5xl">
          Intellectual Property Considerations
        </h1>
        <p className="mt-8 text-[15px] leading-loose text-navy-light">
          The development and use of AI systems can raise a host of intellectual property issues,
          including questions around protecting AI innovations, ownership of AI-generated IP, and
          potential infringement risks.
        </p>
        <h2 className="font-serif-accent mt-10 text-2xl text-navy">Protecting AI Innovations</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-navy-light">
          There are several forms of IP protection potentially available for AI systems and related
          technologies:
        </p>
      </div>
      <div className="space-y-10">
        {cards.map((card) => (
          <div key={card.title} className={`${card.tone} p-8 text-white sm:p-10`}>
            <h3 className="font-heading text-2xl">{card.title}</h3>
            <p className="mt-5 text-[15px] leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
