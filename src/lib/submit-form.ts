import { site } from "@/config/site";

export interface SubmitResult {
  ok: boolean;
  /** 'endpoint' = posted to the form service; 'mailto' = opened the visitor's mail app. */
  mode: "endpoint" | "mailto";
  message: string;
}

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const FAILURE = `Something went wrong sending your message. Please email us directly at ${site.email}.`;

/**
 * Submits form fields to the configured Formspree-compatible endpoint.
 * When no endpoint is configured (static hosting, no backend), falls back to
 * opening a prefilled email in the visitor's mail app: never a dead button.
 */
export async function submitForm(
  subject: string,
  fields: Record<string, string>,
): Promise<SubmitResult> {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ _subject: subject, ...fields }),
      });
      if (res.ok)
        return {
          ok: true,
          mode: "endpoint",
          message: "Thank you. Your message has been sent.",
        };
      return { ok: false, mode: "endpoint", message: FAILURE };
    } catch {
      return { ok: false, mode: "endpoint", message: FAILURE };
    }
  }

  const body = Object.entries(fields)
    .filter(([, value]) => value.trim() !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const mailto =
    `mailto:${site.email}?cc=${site.formCc.join(",")}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return {
    ok: true,
    mode: "mailto",
    message: `Your message is opening in your email app. Press send there. If nothing opens, email us at ${site.email}.`,
  };
}
