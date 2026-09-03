'use client';

import { Button } from '@/components/ui/Button';
import type { BrowserInfo } from '@/lib/intake/browser';
import {
  BROWSER_NAMES,
  CONSULT_PAGE_SHORT_URL,
  MIC_COPY,
  MIC_DENIED,
  MIC_NO_DEVICE,
  MIC_UNSUPPORTED,
  micSteps,
} from '@/lib/intake/copy-mic';
import type { MicController } from '@/lib/intake/use-mic';

interface HelpCardProps {
  title: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

/** A calm card in place of the microphone button: what happened, what to do, and that typing is fine. */
function HelpCard({ title, children, onRetry }: HelpCardProps) {
  return (
    <div role="status" className="rounded-xl border border-brass-400 bg-paper p-5 sm:p-6">
      <p className="text-body font-semibold text-ink">{title}</p>
      <div className="mt-2 space-y-3 text-body text-ink-2">{children}</div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            {MIC_COPY.tryAgain}
          </Button>
        )}
        <p className="text-small text-ink-3">{MIC_COPY.keepTyping}</p>
      </div>
    </div>
  );
}

function DeniedCard({ browser, onRetry }: { browser: BrowserInfo; onRetry(): void }) {
  return (
    <HelpCard title={MIC_DENIED.title} onRetry={onRetry}>
      <p>
        {MIC_DENIED.lead} <strong>{BROWSER_NAMES[browser.kind]}</strong>:
      </p>
      <ol className="space-y-2 pl-1">
        {micSteps(browser).map((step, i) => (
          <li key={step} className="flex gap-3">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-brass-400 font-serif text-small text-brass-600 tabular"
            >
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p>{MIC_DENIED.afterSteps}</p>
    </HelpCard>
  );
}

interface MicHelpProps {
  mic: MicController;
  browser: BrowserInfo;
}

/** What shows instead of the button while checking, or when the microphone cannot be used. */
export function MicHelp({ mic, browser }: MicHelpProps) {
  switch (mic.phase) {
    case 'checking':
      return (
        <p className="text-small text-ink-3" aria-live="polite">
          {MIC_COPY.checking}
        </p>
      );
    case 'unsupported':
      return (
        <HelpCard title={MIC_UNSUPPORTED.title}>
          <p>{MIC_UNSUPPORTED.body}</p>
        </HelpCard>
      );
    case 'no-microphone':
      return (
        <HelpCard title={MIC_NO_DEVICE.title} onRetry={mic.retry}>
          <p>{MIC_NO_DEVICE.body}</p>
          <p>
            {MIC_NO_DEVICE.urlLabel} <strong className="break-words">{CONSULT_PAGE_SHORT_URL}</strong>
          </p>
        </HelpCard>
      );
    case 'denied':
      return <DeniedCard browser={browser} onRetry={mic.retry} />;
    default:
      return null;
  }
}
