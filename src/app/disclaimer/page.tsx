import type { Metadata } from 'next';
import { PageTitleBand } from '@/components/PageTitleBand';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Legal disclaimer and attorney-advertising notice for Rothrock Legal.',
  alternates: { canonical: '/disclaimer/' },
  robots: { index: false },
};

function DraftBanner() {
  return (
    <p className="border-2 border-gold bg-[#FDF6E7] p-4 text-sm font-bold text-maroon-band">
      DRAFT — pending attorney review. This page was prepared as part of the website migration and
      has not yet been reviewed or approved for publication.
    </p>
  );
}

export default function DisclaimerPage() {
  return (
    <>
      <PageTitleBand title="Disclaimer" />
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-14 text-[15px] leading-relaxed">
        <DraftBanner />
        <h2 className="font-heading text-2xl text-black">Attorney Advertising</h2>
        <p>
          This website is a communication and advertisement of {site.name} within the meaning of
          the California Rules of Professional Conduct. It is provided for general informational
          purposes only and is not intended to be, and should not be relied upon as, legal advice
          on any matter.
        </p>
        <h2 className="font-heading text-2xl text-black">No Attorney-Client Relationship</h2>
        <p>
          Viewing this website, submitting the contact form, or communicating with {site.name} by
          email does not create an attorney-client relationship. An attorney-client relationship is
          formed only by a written engagement agreement signed by both you and the firm. Please do
          not send confidential information about any matter until an attorney-client relationship
          has been established.
        </p>
        <h2 className="font-heading text-2xl text-black">No Guarantee of Results</h2>
        <p>
          Testimonials, endorsements, and descriptions of prior results on this website do not
          constitute a guarantee, warranty, or prediction regarding the outcome of your legal
          matter. Every case is different, and outcomes depend on the specific facts and
          circumstances involved.
        </p>
        <h2 className="font-heading text-2xl text-black">Jurisdiction</h2>
        <p>
          Arthur E. Rothrock is licensed to practice law in the State of California. This website
          is not intended to solicit clients in any jurisdiction where the firm&apos;s attorneys
          are not licensed to practice.
        </p>
        <h2 className="font-heading text-2xl text-black">External Links and Content</h2>
        <p>
          Articles, glossaries, and other resources on this site — including content about
          artificial intelligence and the law — reflect the state of the law and technology as of
          their publication dates and may be outdated. Links to third-party websites are provided
          for convenience only and do not constitute an endorsement.
        </p>
        <p>
          Questions about this disclaimer may be directed to{' '}
          <a href={`mailto:${site.email}`} className="text-maroon-band underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    </>
  );
}
