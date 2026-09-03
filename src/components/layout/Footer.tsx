import Link from 'next/link';
import { LinkedInIcon } from '@/components/icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Container } from '@/components/ui/Container';
import { practiceHref, practicePages } from '@/config/practice-areas';
import { courts } from '@/config/service-areas';
import { consultCta, footerResources, legalLinks, site, social } from '@/config/site';

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow font-sans text-white/60">{children}</h2>;
}

const linkClass = 'tap-row text-ui text-white/80 transition-colors hover:text-white';

/**
 * Four columns + compliance bar (IA.md §3, SEO-SPEC §12 #6). Flat maroon-950
 * with the same vertical rhythm as CtaBand, which sits directly above it on
 * every page but the homepage, so the two read as one block.
 */
export function Footer() {
  return (
    <footer className="bg-maroon-950 text-white">
      <Container className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.9fr_1.2fr] lg:py-16">
        <div>
          <BrandLogo lockup="full" tone="white" className="h-24 w-auto" />
          <p className="mt-5 max-w-[32ch] text-ui leading-relaxed text-white/80">{site.tagline}</p>
          <p className="mt-5 text-ui font-semibold text-white">{site.phone}</p>
          <p className="mt-1 max-w-[32ch] text-small text-white/70">{site.consultLine}</p>
          <p className="mt-2 text-ui">
            <Link
              href={consultCta.href}
              className="tap-row gap-1.5 font-semibold text-white underline underline-offset-3 hover:text-white/90"
            >
              {consultCta.label} <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
          <p className="mt-3 text-ui">
            <a
              href={`mailto:${site.email}`}
              className="tap-row text-white/80 underline decoration-white/40 underline-offset-3 hover:text-white hover:decoration-white"
            >
              {site.email}
            </a>
          </p>
          <p className="mt-4 text-small text-white/70">{site.office.appointments}</p>
          <a
            href={social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Arthur Rothrock on LinkedIn"
            className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
        </div>

        <nav aria-label="Practice areas">
          <ColumnHeading>Practice areas</ColumnHeading>
          <ul className="mt-4 lg:mt-5 lg:space-y-2.5">
            {practicePages.map((area) => (
              <li key={area.slug}>
                <Link href={practiceHref(area)} className={linkClass}>
                  {area.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <ColumnHeading>Resources</ColumnHeading>
          <ul className="mt-4 lg:mt-5 lg:space-y-2.5">
            {footerResources.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnHeading>Courts we appear in</ColumnHeading>
          <ul className="mt-5 space-y-3 text-ui text-white/80">
            {courts.map((court) => (
              <li key={court.name}>
                {court.name}
                {court.address && (
                  <span className="block text-small text-white/60">{court.address}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-small text-white/70">{site.hours}</p>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-3 py-6 text-small text-white/65">
          <p>
            &copy; {site.copyrightYear} {site.name} &middot; {site.responsibleAttorney}, attorney
            responsible for this site &middot; {site.office.city}, {site.office.regionName} &middot;
            Attorney advertising
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="tap-row underline underline-offset-3 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </p>
          <p>
            {site.resultsDisclaimer} Super Lawyers is a registered trademark of Thomson Reuters.
          </p>
        </Container>
      </div>
    </footer>
  );
}
