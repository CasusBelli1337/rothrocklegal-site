import { site } from '@/config/site';

export interface SubmitResult {
  ok: boolean;
  message: string;
}

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

/**
 * Submits form fields to the configured Formspree-compatible endpoint.
 * When no endpoint is configured (static hosting, no backend), falls back to
 * opening a prefilled email in the visitor's mail app — never a dead button.
 */
export async function submitForm(
  subject: string,
  fields: Record<string, string>,
): Promise<SubmitResult> {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, ...fields }),
      });
      if (res.ok) {
        return { ok: true, message: 'Thank you — your message has been sent.' };
      }
      return {
        ok: false,
        message: `Something went wrong sending your message. Please email us directly at ${site.email}.`,
      };
    } catch {
      return {
        ok: false,
        message: `Something went wrong sending your message. Please email us directly at ${site.email}.`,
      };
    }
  }

  const body = Object.entries(fields)
    .filter(([, value]) => value.trim() !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const mailto =
    `mailto:${site.email}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return {
    ok: true,
    message: `Your message is opening in your email app — just press send. If nothing opens, email us at ${site.email}.`,
  };
}
