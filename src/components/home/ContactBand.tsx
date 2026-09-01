import { ContactForm } from "@/components/forms/ContactForm";
import { CheckIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { site } from "@/config/site";

interface ContactBandProps {
  /** h1 on /contact/, h2 on the homepage. */
  headingLevel?: "h1" | "h2";
  initialMessage?: string;
  id?: string;
}

const next = [
  "We read it.",
  "We call you.",
  "We tell you the deadlines that matter.",
];

/** HOMEPAGE-SPEC §10: form + phone column; shared with /contact/. */
export function ContactBand({
  headingLevel: Tag = "h2",
  initialMessage,
  id = "contact",
}: ContactBandProps) {
  return (
    <section id={id} className="bg-white py-16 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Tag
            className={`font-serif ${Tag === "h1" ? "text-h1" : "text-h2"} text-ink`}
          >
            Tell us what happened.
          </Tag>
          <p className="mt-4 max-w-[52ch] text-lead text-ink-2">
            A few sentences is enough. We&rsquo;ll read it and get back to you{" "}
            {site.replyPromise}.
          </p>
          <div className="mt-8">
            <ContactForm initialMessage={initialMessage} />
          </div>
        </div>
        <aside
          className="lg:col-span-5 lg:pt-3"
          aria-label="Phone, email, and what happens next"
        >
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-3 font-serif text-stat text-ink tabular hover:text-maroon-700"
          >
            <PhoneIcon className="h-7 w-7 text-brass-500" />
            {site.phone}
          </a>
          <p className="mt-4">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 text-body text-ink-2 underline-offset-3 hover:text-maroon-700 hover:underline"
            >
              <MailIcon className="h-5 w-5 text-brass-500" />
              {site.email}
            </a>
          </p>
          <p className="mt-3 text-body text-ink-2">{site.hours}</p>
          <p className="mt-1 text-body text-ink-2">
            {site.office.appointments}
          </p>
          <h3 className="mt-10 font-sans text-h4 text-ink">
            What happens next
          </h3>
          <ol className="mt-4 space-y-3">
            {next.map((step) => (
              <li
                key={step}
                className="flex items-center gap-3 text-body text-ink-2"
              >
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
