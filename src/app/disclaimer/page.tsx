import { LegalPage } from '@/components/layout/LegalPage';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

const DESCRIPTION =
  'Legal disclaimer and attorney-advertising notice for Rothrock Legal, San Jose, California.';

export const metadata = pageMetadata({
  title: 'Disclaimer & Attorney Advertising',
  description: DESCRIPTION,
  path: '/disclaimer/',
  noindex: site.legalPagesDraft,
});

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Disclaimer and attorney advertising"
      description={DESCRIPTION}
      path="/disclaimer/"
    >
      <h2>Attorney advertising</h2>
      <p>
        This website is a communication and advertisement of {site.name} within the meaning of the
        California Rules of Professional Conduct. {site.responsibleAttorney} is the attorney
        responsible for its content. The firm is located in {site.office.city},{' '}
        {site.office.regionName}. The site is provided for general informational purposes only and
        is not intended to be, and should not be relied upon as, legal advice on any matter.
      </p>
      <h2>
        No <span className="whitespace-nowrap">attorney-client</span> relationship
      </h2>
      <p>
        Viewing this website, using the deadline wizard, submitting the contact form, or
        communicating with {site.name} by email does not create an attorney-client relationship. An
        attorney-client relationship is formed only by a written engagement agreement signed by both
        you and the firm. Please do not send confidential information about any matter until an
        attorney-client relationship has been established.
      </p>
      <h2>Deadlines and estimates</h2>
      <p>
        Deadlines described on this site, including the dates produced by the deadline wizard, are
        general information based only on what you entered. They depend on facts we have not seen,
        and the law changes. Confirm every date with a lawyer before relying on it.
      </p>
      <h2>No guarantee of results</h2>
      <p>
        Testimonials, endorsements, and descriptions of prior results on this website do not
        constitute a guarantee, warranty, or prediction regarding the outcome of your legal matter.
        Every case is different, and outcomes depend on the specific facts and circumstances
        involved.
      </p>
      <h2>Recognitions</h2>
      <p>
        Awards and recognitions are named exactly as conferred by the organizations that issued
        them. Super Lawyers is a registered trademark of Thomson Reuters. No attorney at the firm
        holds a State Bar of California legal specialization certification, and nothing on this site
        should be read as a claim to be a certified specialist.
      </p>
      <h2>Jurisdiction</h2>
      <p>
        Arthur E. Rothrock is licensed to practice law in the State of California. This website is
        not intended to solicit clients in any jurisdiction where the firm&rsquo;s attorneys are not
        licensed to practice.
      </p>
      <h2>External links and dated content</h2>
      <p>
        Articles and other resources on this site reflect the state of the law as of their
        publication dates and may be outdated. Links to third-party websites are provided for
        convenience only and do not constitute an endorsement.
      </p>
      <p>
        Questions about this disclaimer may be directed to{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
