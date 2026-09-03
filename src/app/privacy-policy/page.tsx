import { LegalPage } from '@/components/layout/LegalPage';
import { legal } from '@/components/legal/legal-constants';
import { PrivacyCollect } from '@/components/legal/PrivacyCollect';
import { PrivacyRights } from '@/components/legal/PrivacyRights';
import { PrivacyUse } from '@/components/legal/PrivacyUse';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

const DESCRIPTION =
  'What Rothrock Legal collects through this site and the consult request, how AI and a lawyer review it, and how to ask us to delete it.';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: DESCRIPTION,
  path: '/privacy-policy/',
  noindex: site.legalPagesDraft,
});

/** Privacy policy (CalOPPA, Bus. & Prof. Code § 22575). Clause map: redesign/legal-pages/LEGAL-PAGES-CHECK.md. */
export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description={DESCRIPTION}
      path="/privacy-policy/"
    >
      <p>
        <strong>Effective date:</strong> {legal.effectiveDate}. This policy covers
        www.rothrocklegal.com, including the contact form, the deadline tool, and the consult
        request.
      </p>
      <p>
        {site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) is a law firm in {site.office.city},{' '}
        {site.office.regionName}. People who come to this site are usually worried about a family
        member&rsquo;s trust or estate and are deciding whether to tell a lawyer about it. This page
        explains, in plain English, what happens to what you tell us.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>We collect only what you type, say, or upload. No tracking, no analytics, no ads.</li>
        <li>
          We use it for one thing: to decide whether we can help you, which includes a conflict
          check.
        </li>
        <li>
          AI helps us organize a consult request so a lawyer can review it faster. A lawyer reviews
          everything. The AI provider does not train on what you send.
        </li>
        <li>
          As part of conflict checking and case review we may look at public court records about the
          people and disputes you describe.
        </li>
        <li>Video meetings happen on Google Meet. Nothing from Google runs on this website.</li>
        <li>We never sell or share your information for advertising.</li>
        <li>
          If we do not take your matter, we delete what you sent after{' '}
          {legal.declinedRetentionMonths} months. You can ask us to delete it sooner.
        </li>
        <li>
          Sending us information does not make you a client, but we keep it confidential either way.
        </li>
      </ul>

      <PrivacyCollect />
      <PrivacyUse />
      <PrivacyRights />
    </LegalPage>
  );
}
