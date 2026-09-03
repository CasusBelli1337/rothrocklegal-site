import { CheckIcon } from '@/components/icons';
import type { SignSubmitResponse } from '@/lib/public/contract';
import { SIGN_COPY } from '@/lib/public/copy';
import { formatTime } from '@/lib/public/time';

/** The thank-you after signing: when we received it, and what happens next. */
export function SignDone({ result }: { result: SignSubmitResponse }) {
  const copy = SIGN_COPY.done;
  return (
    <div className="wizard-enter border border-line bg-white p-5 sm:p-8">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center bg-success text-white"
        >
          <CheckIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-2 font-serif text-h2 text-ink">{copy.title}</h2>
          <p className="mt-3 text-body text-ink">{copy.received(formatTime(result.signedAt))}</p>
          <p className="mt-2 text-body text-ink-2">{copy.copy}</p>
        </div>
      </div>
      <p className="mt-6 border-t border-line pt-5 text-body text-ink-2">
        {result.nextSigner ? copy.nextWithOthers : copy.nextFirm}
      </p>
    </div>
  );
}
