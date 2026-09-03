'use client';

import { RESUME_COPY } from '@/lib/intake/copy';
import type { ResumeController } from '@/lib/intake/use-resume';

/** Above the steps while an emailed link is being exchanged, and once it has (or could not be). */
export function ResumeNotice({ resume }: { resume: ResumeController }) {
  if (resume.phase === 'idle') return null;
  if (resume.phase === 'loading') {
    return (
      <div role="status" aria-live="polite" className="wizard-banner mb-8 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
        />
        <p className="text-body text-ink">{RESUME_COPY.loading}</p>
      </div>
    );
  }
  const failed = resume.phase === 'failed';
  return (
    <div
      role={failed ? 'alert' : 'status'}
      className={`${failed ? 'wizard-alert' : 'wizard-banner'} mb-8`}
    >
      <p className="text-body text-ink">{failed ? RESUME_COPY.failed : RESUME_COPY.restored}</p>
    </div>
  );
}
