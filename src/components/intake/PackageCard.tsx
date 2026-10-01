'use client';

import { buttonClass } from '@/components/ui/Button';
import type { Session } from '@/lib/intake/api';
import { PACKAGE_COPY } from '@/lib/intake/copy';
import { packageDetails, type ReadyPackage } from '@/lib/intake/package';
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

function Ready({ pkg }: { pkg: ReadyPackage }) {
  return (
    <>
      <a
        href={pkg.url}
        download
        className={buttonClass('primary', 'md', 'light', 'w-full sm:w-auto')}
      >
        {PACKAGE_COPY.download}
      </a>
      <p className="mt-3 text-small text-ink-3">{packageDetails(pkg).join(' ')}</p>
    </>
  );
}

/**
 * The done screen's "Your package" card: a calm line while the server builds
 * the zip, then the download. Nothing at all (no card, no gap) until the
 * first answer, or when the server has no package to offer.
 */
export function PackageCard({ session }: { session: Session | null }) {
  const { phase, ready } = usePackage(session);
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
        {phase === 'ready' && ready && <Ready pkg={ready} />}
        {phase === 'slow' && <p className="text-body text-ink">{PACKAGE_COPY.slow}</p>}
      </div>
    </section>
  );
}
