import Image from 'next/image';
import Link from 'next/link';
import { MailingListForm } from '@/components/forms/MailingListForm';
import { asset, footerLinks, legalLinks, site } from '@/config/site';

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base text-white">{children}</h3>
      <div className="mt-2 mb-4 h-px w-16 bg-white/40" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-maroon-band pt-14 text-white">
      <div className="px-4">
        <MailingListForm />
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/25 px-6 pt-10 pb-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Image
              src={asset('/images/logo-white.png')}
              alt={`${site.name} logo`}
              width={190}
              height={105}
            />
          </div>

          <nav aria-label="Footer">
            <ColumnHeading>Quick Links</ColumnHeading>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnHeading>About Us</ColumnHeading>
            <p className="text-[11px] leading-relaxed">{site.aboutBlurb}</p>
          </div>

          <div>
            <ColumnHeading>Contact Info</ColumnHeading>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-gold">Location</dt>
                <dd>{site.location}</dd>
              </div>
              <div>
                <dt className="font-bold text-gold">Phone</dt>
                <dd>
                  <a href={site.phoneHref} className="hover:text-gold">
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gold">Email Address</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="underline hover:text-gold">
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/25 pt-6 pb-2 text-sm">
          <p>
            Copyright &copy; {site.copyrightYear}, {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/80">
            {legalLinks.map((item, i) => (
              <span key={item.href}>
                {i > 0 && ' · '}
                <Link href={item.href} className="underline hover:text-gold">
                  {item.label}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
