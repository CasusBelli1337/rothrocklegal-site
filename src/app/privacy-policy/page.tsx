import { LegalPage } from '@/components/layout/LegalPage';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

const DESCRIPTION =
  'How rothrocklegal.com handles the information you send through the contact form and the deadline wizard.';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: DESCRIPTION,
  path: '/privacy-policy/',
  noindex: site.legalPagesDraft,
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description={DESCRIPTION}
      path="/privacy-policy/"
    >
      <p>
        This Privacy Policy describes how {site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) handles
        information collected through this website.
      </p>
      <h2>What we collect</h2>
      <p>
        When you use the contact form, we collect the information you choose to provide: your name,
        email address, phone number, what happened, and whether you have received a formal notice.
        This website does not use tracking cookies and does not collect analytics identifiers.
      </p>
      <p>
        The deadline wizard on this site saves your answers in your own browser so you can come back
        to them. Nothing you enter in the wizard is sent to us unless you submit the contact form.
      </p>
      <h2>How we use it</h2>
      <p>
        We use the information you submit only to respond to your inquiry and evaluate a potential
        engagement. We do not sell or rent your personal information.
      </p>
      <h2>Service providers</h2>
      <p>
        Form submissions may be processed by a third-party form service acting on our behalf, and
        email you send us is handled by our email provider. These providers process your information
        only to deliver it to us.
      </p>
      <h2>California privacy rights</h2>
      <p>
        California residents may have rights under the California Consumer Privacy Act (CCPA),
        including the right to know what personal information we hold about you and to request its
        deletion. To exercise these rights, contact us at{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Confidentiality</h2>
      <p>
        We keep what you send us confidential, but information submitted through this website is not
        protected by the attorney-client privilege unless and until an attorney-client relationship
        is established by a signed engagement letter. Please do not send documents or detailed
        confidential information through the contact form.
      </p>
      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. The current version will always be posted on
        this page.
      </p>
    </LegalPage>
  );
}
