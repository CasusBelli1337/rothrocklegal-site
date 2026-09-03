import { ContactForm } from '@/components/forms/ContactForm';
import { CheckIcon, MailIcon, PhoneIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { consultCta, site } from '@/config/site';

interface ContactBandProps {
  /** h1 on /contact/, h2 on the homepage. */
  headingLevel?: 'h1' | 'h2';
  initialMessage?: string;
  id?: string;
  /** The phone number, as text and never a button: only /contact/ and the footer show it. */
  showPhone?: boolean;
}

/** HOMEPAGE-SPEC §10: the short form, with the consult request as the primary path beside it; shared with /contact/. */
export function ContactBand({
  headingLevel: Tag = 'h2',
  initialMessage,
  id = 'contact',
  showPhone = false,
}: ContactBandProps) {
  // Keeps the outline in order: the aside headings sit one level under the band's heading.
  const Sub = Tag === 'h1' ? 'h2' : 'h3';
  return (
    <section id={id} className="bg-white py-16 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Tag className={`font-serif ${Tag === 'h1' ? 'text-h1' : 'text-h2'} text-ink`}>
            Tell us your story.
          </Tag>
          <p className="mt-4 max-w-[52ch] text-lead text-ink-2">
            A few sentences is enough. {site.replyPromise}
          </p>
          <div className="mt-8">
            <ContactForm initialMessage={initialMessage} />
          </div>
        </div>
        <aside
          className="lg:col-span-5 lg:pt-3"
          aria-label="Consult request, email, and what happens next"
        >
          <Sub className="font-serif text-h3 text-ink">Rather say it, or send documents?</Sub>
          <p className="mt-2 max-w-[44ch] text-body text-ink-2">
            {site.consultLine} Write it or record it, and upload what you have.
          </p>
          <Button href={consultCta.href} className="mt-4">
            {consultCta.label}
          </Button>
          {showPhone && (
            <p className="mt-8 inline-flex items-center gap-3 font-serif text-h2 text-ink tabular sm:text-stat">
              <PhoneIcon className="h-7 w-7 text-brass-500" />
              {site.phone}
            </p>
          )}
          <p className={showPhone ? 'mt-4' : 'mt-8'}>
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
