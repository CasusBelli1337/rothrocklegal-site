import { MailIcon } from '@/components/icons';
import { site } from '@/config/site';

/** Shown inside the panel when the intake API cannot be reached: a plain notice and the email address, so the page never dead-ends. */
export function Fallback() {
  return (
    <div className="mt-4 pb-6">
      <div className="wizard-banner" role="status">
        <p className="text-body text-ink">
          Our online intake is not available right now. Please email us instead. We read every
          message and reply by email.
        </p>
      </div>
      <h2 className="mt-8 font-serif text-h3 text-ink">Email us what happened</h2>
      <p className="mt-2 text-body text-ink-2">
        Tell us who died, when, and what changed, and attach anything you have. We will ask for the
        rest. {site.replyPromise}
      </p>
      <p className="mt-6">
        <a
          href={`mailto:${site.email}`}
          className="tap-link inline-flex items-center gap-2 text-body font-semibold text-maroon-700 underline underline-offset-3 hover:text-maroon-800"
        >
          <MailIcon className="h-5 w-5 text-brass-500" />
          {site.email}
        </a>
      </p>
    </div>
  );
}
