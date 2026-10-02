'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { errorMessage, requestPackageLink, type Session } from '@/lib/intake/api';
import { PACKAGE_COPY } from '@/lib/intake/copy';
import { packageDetails, submitDownload, type ReadyPackage } from '@/lib/intake/package';
import { usePackage } from '@/lib/intake/use-package';

/** Small and calm; the site's reduced-motion rules (system or reading options) hold it still. */
function PulseDot() {
  return (
    <span
      aria-hidden="true"
      className="mt-2.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-maroon-900"
    />
  );
}

/**
 * The download is a form POST to the one-use link (`submitDownload`); the
 * browser saves the zip and stays here. The pressed link is spent, so the
 * button waits for the fresh one the hook fetches.
 */
function DownloadButton({ pkg, afterDownload }: { pkg: ReadyPackage; afterDownload: () => void }) {
  const [spent, setSpent] = useState<string | null>(null);
  return (
    <button
      type="button"
      disabled={spent === pkg.url}
      onClick={() => {
        setSpent(pkg.url);
        submitDownload(pkg.url);
        afterDownload();
      }}
      className={buttonClass('primary', 'md', 'light', 'w-full sm:w-auto')}
    >
      {PACKAGE_COPY.download}
    </button>
  );
}

type NewLinkState = { phase: 'idle' | 'sending' | 'sent' } | { phase: 'failed'; message: string };

/** "Send me a new link": the server emails a new one-use link to the request's own address. */
function NewLink({ session, email }: { session: Session; email: string }) {
  const [state, setState] = useState<NewLinkState>({ phase: 'idle' });
  const send = async () => {
    setState({ phase: 'sending' });
    try {
      await requestPackageLink(session);
      setState({ phase: 'sent' });
    } catch (error) {
      setState({ phase: 'failed', message: errorMessage(error) });
    }
  };
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void send()}
        disabled={state.phase === 'sending'}
        className={buttonClass('secondary', 'sm', 'light', 'w-full sm:w-auto')}
      >
        {state.phase === 'sending' ? PACKAGE_COPY.newLinkSending : PACKAGE_COPY.newLink}
      </button>
      <p role="status" aria-live="polite" className="mt-2 text-small text-ink-2">
        {state.phase === 'sent' && PACKAGE_COPY.newLinkSent(email)}
        {state.phase === 'failed' && state.message}
      </p>
    </div>
  );
}

function Ready({ pkg, afterDownload }: { pkg: ReadyPackage; afterDownload: () => void }) {
  return (
    <>
      <DownloadButton pkg={pkg} afterDownload={afterDownload} />
      <p className="mt-3 text-small text-ink-3">{packageDetails(pkg).join(' ')}</p>
    </>
  );
}

/**
 * The done screen's "Your package" card: a calm line while the server builds
 * the zip (the summary memo and the documents), then the download and "Send me
 * a new link". Nothing at all (no card, no gap) until the first answer, or
 * when the server has no package to offer.
 */
export function PackageCard({ session, email = '' }: { session: Session | null; email?: string }) {
  const { phase, ready, afterDownload } = usePackage(session);
  if (phase === 'checking' || phase === 'unavailable') return null;
  return (
    <section
      aria-labelledby="package-heading"
      className="mt-6 border border-line border-t-4 border-t-brass-400 bg-white p-5 sm:p-6"
    >
      <h3 id="package-heading" className="eyebrow">
        {PACKAGE_COPY.title}
      </h3>
      <p className="mt-3 text-body text-ink-2">{PACKAGE_COPY.what}</p>
      <div role="status" aria-live="polite" className="mt-4">
        {phase === 'preparing' && (
          <p className="flex items-start gap-3 text-body font-medium text-ink">
            <PulseDot />
            {PACKAGE_COPY.preparing}
          </p>
        )}
        {phase === 'ready' && ready && <Ready pkg={ready} afterDownload={afterDownload} />}
        {phase === 'slow' && <p className="text-body text-ink">{PACKAGE_COPY.slow}</p>}
      </div>
      {phase === 'ready' && ready && session && <NewLink session={session} email={email} />}
    </section>
  );
}
