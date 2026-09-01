"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitForm } from "@/lib/submit-form";

const inputClass =
  "h-12 w-full rounded-md border border-line-strong bg-white px-3 text-body text-ink placeholder:text-ink-4 " +
  "focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/30";

const labelClass = "block text-small font-medium text-ink";

const NOTICE_OPTIONS = ["Yes", "No", "Not sure"] as const;

interface ContactFormProps {
  /** Prefills the message box (the deadline wizard passes its summary). */
  initialMessage?: string;
}

interface Status {
  tone: "idle" | "success" | "error";
  text: string;
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/** HOMEPAGE-SPEC §10 fields. Submits through `submitForm`; redirects to /contact/thank-you/ on success. */
export function ContactForm({ initialMessage }: ContactFormProps = {}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ tone: "idle", text: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string): string => String(data.get(name) ?? "");
    setBusy(true);
    setStatus({ tone: "idle", text: "Sending…" });
    const result = await submitForm("Website inquiry – rothrocklegal.com", {
      name: field("name"),
      email: field("email"),
      phone: field("phone"),
      message: field("message"),
      notice: field("notice"),
    });
    if (result.ok && result.mode === "endpoint") {
      router.push("/contact/thank-you/");
      return;
    }
    setStatus({ tone: result.ok ? "success" : "error", text: result.message });
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="cf-name" label="Name (required)">
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>
        <Field id="cf-email" label="Email (required)">
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </Field>
      </div>
      <Field id="cf-phone" label="Phone">
        <input
          id="cf-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClass}
        />
      </Field>
      <Field id="cf-message" label="What happened?">
        <textarea
          id="cf-message"
          name="message"
          rows={initialMessage ? 10 : 4}
          defaultValue={initialMessage}
          placeholder="Who died, when, and what changed. A few sentences is enough."
          className={`${inputClass} h-auto py-3`}
        />
      </Field>
      <fieldset>
        <legend className={labelClass}>
          Has a trustee or lawyer sent you a formal notice?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTICE_OPTIONS.map((option) => (
            <label
              key={option}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-white px-4 text-body text-ink has-[:checked]:border-maroon-700 has-[:checked]:bg-maroon-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-maroon-500/40"
            >
              <input
                type="radio"
                name="notice"
                value={option}
                className="h-4 w-4 accent-maroon-700"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" loading={busy} className="sm:w-40">
          Send
        </Button>
        <p className="text-small text-ink-3">
          We keep what you send us confidential. Sending this form doesn&rsquo;t
          make us your lawyers yet &ndash; an engagement letter does.
        </p>
      </div>
      <p
        aria-live="polite"
        className={`text-small ${status.tone === "error" ? "text-error" : status.tone === "success" ? "text-success" : "text-ink-3"}`}
      >
        {status.text}
      </p>
    </form>
  );
}
