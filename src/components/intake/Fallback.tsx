import { ContactForm } from '@/components/forms/ContactForm';

/** Shown when the intake API cannot be reached: a plain notice plus the simple email form. */
export function Fallback() {
  return (
    <div className="rounded-xl border border-line bg-white p-6 sm:p-10">
      <div className="wizard-banner" role="status">
        <p className="text-body text-ink">
          Our online intake is not available right now. Use the short form below instead. We read
          every message and reply by email.
        </p>
      </div>
      <h2 className="mt-8 font-serif text-h3 text-ink">Tell us what happened</h2>
      <p className="mt-2 text-body text-ink-2">
        Who died, when, and what changed. A few sentences is enough. We will ask for the rest.
      </p>
      <div className="mt-6">
        <ContactForm />
      </div>
    </div>
  );
}
