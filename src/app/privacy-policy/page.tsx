import type { Metadata } from 'next';
import { PageTitleBand } from '@/components/PageTitleBand';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for rothrocklegal.com.',
  alternates: { canonical: '/privacy-policy/' },
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageTitleBand title="Privacy Policy" />
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-14 text-[15px] leading-relaxed">
        <p className="border-2 border-gold bg-[#FDF6E7] p-4 text-sm font-bold text-maroon-band">
          DRAFT — pending attorney review. This page was prepared as part of the website migration
          and has not yet been reviewed or approved for publication.
        </p>
        <p>
          This Privacy Policy describes how {site.name} (&quot;we,&quot; &quot;us&quot;) handles
          information collected through this website.
        </p>
        <h2 className="font-heading text-2xl text-black">Information We Collect</h2>
        <p>
          When you use the contact form or join our mailing list, we collect the information you
          choose to provide — such as your name, email address, phone number, and message. This
          website does not use tracking cookies and does not collect analytics identifiers.
        </p>
        <h2 className="font-heading text-2xl text-black">How We Use Information</h2>
        <p>
          We use the information you submit solely to respond to your inquiry, evaluate a potential
          engagement, and send mailing-list updates you have requested. We do not sell or rent your
          personal information.
        </p>
        <h2 className="font-heading text-2xl text-black">Service Providers</h2>
        <p>
          Form submissions may be processed by a third-party form service acting on our behalf, and
          email you send us is handled by our email provider. These providers process your
          information only to deliver it to us.
        </p>
        <h2 className="font-heading text-2xl text-black">California Privacy Rights</h2>
        <p>
          California residents may have rights under the California Consumer Privacy Act (CCPA),
          including the right to know what personal information we hold about you and to request
          its deletion. To exercise these rights, contact us at{' '}
          <a href={`mailto:${site.email}`} className="text-maroon-band underline">
            {site.email}
          </a>
          .
        </p>
        <h2 className="font-heading text-2xl text-black">Confidentiality Note</h2>
        <p>
          Information submitted through this website is not protected by the attorney-client
          privilege unless and until an attorney-client relationship is established. Please do not
          submit confidential details about your matter through the contact form.
        </p>
        <h2 className="font-heading text-2xl text-black">Changes</h2>
        <p>
          We may update this policy from time to time. The current version will always be posted on
          this page.
        </p>
      </div>
    </>
  );
}
