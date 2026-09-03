interface ProgressBarProps {
  step: number;
  total: number;
  /** "about 2 minutes to go", from `minutesToGo` in copy.ts. */
  timeLeft: string;
}

/** "Step 3 of 8 · about 2 minutes to go" plus the maroon bar (DESIGN-BRIEF §6 "Wizard step"; styles from wizard.css). */
export function ProgressBar({ step, total, timeLeft }: ProgressBarProps) {
  const percent = Math.round((step / total) * 100);
  return (
    <div>
      <p className="text-meta text-ink-3 tabular" aria-live="polite">
        Step {step} of {total}
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, </span>
        {timeLeft}
      </p>
      <div className="wizard-progress mt-3" aria-hidden="true">
        <div className="wizard-progress-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
