import Link from 'next/link';
import { LegalPage } from '@/components/layout/LegalPage';
import { legal } from '@/components/legal/legal-constants';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

const DESCRIPTION =
  'Attorney advertising notice and legal disclaimer for Rothrock Legal, a trust and estate litigation firm in San Jose, California.';

export const metadata = pageMetadata({
  title: 'Disclaimer & Attorney Advertising',
  description: DESCRIPTION,
  path: '/disclaimer/',
  noindex: site.legalPagesDraft,
});

/**
 * Disclaimer and attorney-advertising notice (Cal. Rules of Prof. Conduct 7.1 to 7.5;
 * Bus. & Prof. Code §§ 6157 to 6159.2). Clause map: redesign/legal-pages/LEGAL-PAGES-CHECK.md.
 */
export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Disclaimer and attorney advertising"
      description={DESCRIPTION}
      path="/disclaimer/"
    >
      <p>
        <strong>Effective date:</strong> {legal.effectiveDate}. Please read this page before you
        rely on anything on this site or send us information.
      </p>

      <h2>Attorney advertising</h2>
      <p>
        This website is an advertisement for legal services under the California Rules of
        Professional Conduct and the State Bar Act (Business and Professions Code sections 6157 to
        6159.2). {site.responsibleAttorney} is the attorney responsible for its content. The firm is{' '}
        {site.name}, located in {site.office.city}, {site.office.regionName}. Reaching us:{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a> or {site.phone}.
      </p>

      <h2>General information, not legal advice</h2>
      <p>
        The pages, articles, answers, and tools on this site are general information about
        California trust and estate law. They are not legal advice, and they are not a substitute
        for talking to a lawyer about your own facts. The law changes, and articles reflect the law
        as of the date shown on them. Do not act, or decide not to act, based on something you read
        here without first confirming it with a lawyer.
      </p>

      <h2>
        No <span className="whitespace-nowrap">attorney-client</span> relationship until we both
        sign
      </h2>
      <p>
        Reading this site, using the deadline tool, sending a consult request or a contact-form
        note, or emailing us does not make you a client and does not create an attorney-client
        relationship. That relationship begins only when you and the firm both sign a written
        engagement letter. Until then, we are not your lawyers, we have not agreed to protect any
        deadline for you, and we may decline your matter. We run a conflict check before we can
        discuss any matter, and if there is a conflict we may have to decline without saying why.
      </p>

      <h2>Deadlines are fact-specific</h2>
      <p>
        Every deadline described on this site depends on facts we have not seen: what documents were
        signed, what notices were mailed and when, who received them, and what a court has already
        done. Some deadlines are as short as 120 days, and missing one can end a case before it
        starts. Treat every date on this site as a reason to talk to a lawyer promptly, not as a
        calculation you can rely on.
      </p>

      <h2>The deadline tool and the consult request produce estimates only</h2>
      <p>
        The &ldquo;How Long Do I Have?&rdquo; tool applies a fixed set of rules to the answers you
        give it. It cannot see your documents, it cannot know about exceptions that apply to you,
        and its results are estimates, not advice. The consult request uses an AI service to
        organize and summarize what you send so that a lawyer can review it faster. The AI does not
        evaluate your case, does not give advice, and does not decide whether we take your matter; a
        lawyer does. Any follow-up questions it drafts are requests for information, not opinions
        about your case.
      </p>

      <h2>No guarantee of results</h2>
      <p>
        We do not promise or predict any outcome. Descriptions of prior matters, client comments,
        and recognitions on this site are not a guarantee, warranty, or prediction of the outcome of
        your matter. {site.resultsDisclaimer}
      </p>

      <h2>Recognitions and specialization</h2>
      <p>
        Awards and recognitions are named exactly as the organizations that issued them confer them,
        and those names belong to those organizations. Super Lawyers is a registered trademark of
        Thomson Reuters. No attorney at the firm holds a State Bar of California legal
        specialization certification, and nothing on this site should be read as a claim to be a
        certified specialist.
      </p>

      <h2>Information you send us before we are engaged</h2>
      <p>
        We keep what you send us confidential, whether or not we take your matter, as the rules for
        California lawyers require (Rule 1.18). Even so, please keep these three things in mind.
        First, sending us information does not by itself stop us from representing someone else in
        the same matter, except where those rules say otherwise. Second, do not send us documents
        that belong to another lawyer&rsquo;s client file, that you took without permission, or that
        you were told you may not share. Third, ordinary email is not fully secure, so do not
        include Social Security numbers, account numbers, or passwords unless we ask for them. How
        we store and delete what you send is described in our{' '}
        <Link href="/privacy-policy/">Privacy Policy</Link>.
      </p>

      <h2>Jurisdiction</h2>
      <p>
        Our attorneys are licensed to practice law in the State of California only, and this site
        describes California law. We do not seek clients in any state or country where our attorneys
        are not licensed, and we do not give advice about the laws of other states. Our cases are
        heard in California courts, including the Santa Clara County Superior Court in San Jose and
        the courts of neighboring Bay Area counties.
      </p>

      <h2>Links to other websites</h2>
      <p>
        Some pages link to courts, government agencies, and other websites we do not control. Those
        links are for your convenience only. We are not responsible for their content, and a link is
        not an endorsement.
      </p>

      <h2>Questions</h2>
      <p>
        Questions about this page go to <a href={`mailto:${site.email}`}>{site.email}</a>. The
        responsible attorney is {site.responsibleAttorney}, {site.name}, {site.office.city},{' '}
        {site.office.regionName}.
      </p>
    </LegalPage>
  );
}
