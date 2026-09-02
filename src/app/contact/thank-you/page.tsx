import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { consultCta, site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Message received',
  description:
    'Thanks for reaching out to Rothrock Legal. We have your message and will be in touch.',
  path: '/contact/thank-you/',
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <Container className="max-w-[44rem] py-16 lg:py-24">
      <p className="eyebrow">Message received</p>
      <h1 className="mt-3 font-serif text-h1 text-ink">Thanks. We have it.</h1>
      <p className="mt-5 text-lead text-ink-2">
        We&rsquo;ll read what you sent. {site.replyPromise} If you have documents to share or would
        rather say it out loud, a consult request takes uploads and voice.
      </p>
      <ol className="mt-8 space-y-3">
        {site.nextSteps.map((step) => (
          <li key={step} className="flex items-center gap-3 text-body text-ink-2">
            <CheckIcon className="h-5 w-5 shrink-0 text-brass-500" />
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href={consultCta.href}>{consultCta.label}</Button>
        <Button variant="ghost" href="/">
          Back to the homepage
        </Button>
      </div>
    </Container>
  );
}
