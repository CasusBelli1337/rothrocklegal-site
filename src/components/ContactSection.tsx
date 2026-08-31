import { ContactForm } from '@/components/forms/ContactForm';
import { LinkedInIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/icons';
import { site, social } from '@/config/site';

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-maroon-btn text-maroon-btn">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-black">{label}</p>
        <p className="text-sm text-navy-light">{children}</p>
      </div>
    </div>
  );
}

/** Contact form + "Get In Touch With Us" info column (used on Home and Contact). */
export function ContactSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[3fr_2fr]">
      <ContactForm />
      <div>
        <p className="eyebrow">Contact Us</p>
        <h2 className="font-serif-accent mt-2 text-3xl font-semibold text-black">
          Get In Touch With Us
        </h2>
        <div className="mt-8 space-y-6">
          <InfoRow icon={<PinIcon />} label="Location">
            {site.location}
          </InfoRow>
          <InfoRow icon={<PhoneIcon />} label="Phone">
            <a href={site.phoneHref} className="hover:underline">
              {site.phone}
            </a>
          </InfoRow>
          <InfoRow icon={<MailIcon />} label="Email Address">
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </InfoRow>
        </div>
        <p className="mt-8 text-sm font-bold text-black">Follow Us</p>
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Arthur Rothrock on LinkedIn"
          className="mt-3 inline-block text-[#0A66C2]"
        >
          <LinkedInIcon className="h-10 w-10" />
        </a>
      </div>
    </section>
  );
}
