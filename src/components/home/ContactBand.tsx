import { CheckIcon, MailIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { consultCta, site } from '@/config/site';

interface ContactBandProps {
  /** h1 on /contact/, h2 on the homepage. */
  headingLevel?: 'h1' | 'h2';
  id?: string;
}

/**
 * The consult band, shared by the homepage bottom and /contact/: the consult
 * request is the one way in (the short "Tell us your story" form retired
 * 2026-09-03 and the phone number removed the same day, both at Arthur's
 * request), with email, hours, and what happens next beside it.
 */
export function ContactBand({ headingLevel: Tag = 'h2', id = 'contact' }: ContactBandProps) {
  // Keeps the outline in order: the aside heading sits one level under the band's heading.
  const Sub = Tag === 'h1' ? 'h2' : 'h3';
  return (
    <section id={id} className="bg-white py-16 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Tag className={`font-serif ${Tag === 'h1' ? 'text-h1' : 'text-h2'} text-ink`}>
            Start with a consult request.
          </Tag>
          <p className="mt-4 max-w-[52ch] text-lead text-ink-2">
            {site.consultLine} Write it or record it, and upload what you have. {site.replyPromise}
          </p>
          <Button href={consultCta.href} className="mt-8">
            {consultCta.label}
          </Button>
        </div>
        <aside className="lg:col-span-5 lg:pt-3" aria-label="Email, hours, and what happens next">
          <p>
            <a
              href={`mailto:${site.email}`}
              className="tap-link inline-flex items-center gap-2 text-body text-ink-2 underline decoration-line-strong underline-offset-3 hover:text-maroon-700 hover:decoration-current"
            >
              <MailIcon className="h-5 w-5 text-brass-500" />
              {site.email}
            </a>
          </p>
          <p className="mt-3 text-body text-ink-2">{site.hours}</p>
          <p className="mt-1 text-body text-ink-2">{site.office.appointments}</p>
          <Sub className="mt-10 font-sans text-h4 text-ink">What happens next</Sub>
          <ol className="mt-4 space-y-3">
            {site.nextSteps.map((step) => (
              <li key={step} className="flex items-center gap-3 text-body text-ink-2">
                <CheckIcon className="h-5 w-5 shrink-0 text-brass-500" />
                {step}
              </li>
            ))}
          </ol>
        </aside>
      </Container>
    </section>
  );
}
