'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/submit-form';

export function MailingListForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus('Submitting…');
    const result = await submitForm('Mailing list signup — rothrocklegal.com', {
      email,
      consent: consent ? 'yes' : 'no',
      form: 'mailing-list',
    });
    setStatus(result.message);
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl bg-[#EFE7EB] px-8 py-8 text-black">
      <h2 className="font-serif-accent text-2xl">Join our mailing list</h2>
      <label htmlFor="ml-email" className="mt-4 block font-serif-accent text-sm font-semibold">
        Email *
      </label>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <input
          id="ml-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 flex-1 border border-gray-400 bg-white px-3 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-10 border-2 border-black px-6 font-serif-accent text-base disabled:opacity-60"
        >
          Subscribe
        </button>
      </div>
      <label className="mt-4 flex items-center gap-2 font-serif-accent text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="h-4 w-4 accent-black"
        />
        I want to subscribe to your mailing list.
      </label>
      <p aria-live="polite" className="mt-3 text-sm text-maroon-band">
        {status}
      </p>
    </form>
  );
}
