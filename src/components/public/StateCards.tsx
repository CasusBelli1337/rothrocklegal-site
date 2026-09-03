import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SHARED_COPY } from '@/lib/public/copy';

export const CARD_CLASS = 'rounded-xl border border-line bg-white p-5 sm:p-8';

/** A spinner and one line while the link is checked or the agreement fetched. */
export function LoadingCard({ text }: { text: string }) {
  return (
    <div role="status" aria-live="polite" className={`${CARD_CLASS} flex items-center gap-4`}>
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
      />
      <p className="text-body text-ink">{text}</p>
    </div>
  );
}

interface NoticeCardProps {
  title: string;
  body?: string;
  tone: 'alert' | 'banner';
  action?: { label: string; onClick(): void };
}

/** A bad link, a failed load with a retry, or an agreement already signed. */
export function NoticeCard({ title, body, tone, action }: NoticeCardProps) {
  return (
    <div
      role={tone === 'alert' ? 'alert' : 'status'}
      className={`${tone === 'alert' ? 'wizard-alert' : 'wizard-banner'} p-5 sm:p-8`}
    >
      <h2 className="font-serif text-h3 text-ink">{title}</h2>
      {body && <p className="mt-3 max-w-[60ch] text-body text-ink-2">{body}</p>}
      {action && (
        <div className="mt-6">
          <Button variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

/** The questions line and the disclaimer link under every state. */
export function SmallPrint({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-2 text-small text-ink-3">
      {children && <p>{children}</p>}
      <p>
        {SHARED_COPY.questions}{' '}
        <Link href="/disclaimer/" className="tap-link underline underline-offset-3 hover:text-maroon-700">
          {SHARED_COPY.disclaimerLink}
        </Link>
      </p>
    </div>
  );
}
