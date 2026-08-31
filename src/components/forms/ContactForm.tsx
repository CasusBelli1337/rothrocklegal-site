'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/submit-form';

const inputClass = 'h-11 w-full border-0 bg-white px-3 text-sm text-black placeholder-gray-500';

export function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string): string => String(data.get(name) ?? '');
    setBusy(true);
    setStatus('Submitting…');
    const result = await submitForm('Website inquiry — rothrocklegal.com', {
      name: field('name'),
      email: field('email'),
      subject: field('subject'),
      phone: field('phone'),
      message: field('message'),
    });
    setStatus(result.message);
    setBusy(false);
  }

  return (
    <div className="border border-gold p-4 sm:p-6">
      <form onSubmit={onSubmit} className="bg-maroon-band p-6 sm:p-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sr-only" htmlFor="cf-name">
            Name
          </label>
          <input id="cf-name" name="name" type="text" required placeholder="Name" className={inputClass} />
          <label className="sr-only" htmlFor="cf-email">
            Email
          </label>
          <input id="cf-email" name="email" type="email" required placeholder="Email" className={inputClass} />
          <label className="sr-only" htmlFor="cf-subject">
            Subject
          </label>
          <input id="cf-subject" name="subject" type="text" placeholder="Subject" className={inputClass} />
          <label className="sr-only" htmlFor="cf-phone">
            Phone
          </label>
          <input id="cf-phone" name="phone" type="tel" placeholder="Phone" className={inputClass} />
        </div>
        <label className="sr-only" htmlFor="cf-message">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={6}
          placeholder="Type your message here..."
          className="mt-4 w-full border-0 bg-white p-3 text-sm text-black placeholder-gray-500"
        />
        <div className="mt-6 text-center">
          <button
            type="submit"
            disabled={busy}
            className="bg-white px-10 py-2.5 text-sm text-black transition hover:bg-offwhite disabled:opacity-60"
          >
            Submit
          </button>
        </div>
        <p aria-live="polite" className="mt-4 text-center text-sm text-white">
          {status}
        </p>
      </form>
    </div>
  );
}
