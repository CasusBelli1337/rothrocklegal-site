interface ProgressBarProps {
  step: number;
  total: number;
}

/** "Step 3 of 8" plus the maroon bar (DESIGN-BRIEF §6 "Wizard step"; styles from wizard.css). */
export function ProgressBar({ step, total }: ProgressBarProps) {
  const percent = Math.round((step / total) * 100);
  return (
    <div>
      <p className="text-meta text-ink-3 tabular" aria-live="polite">
        Step {step} of {total}
      </p>
      <div className="wizard-progress mt-3" aria-hidden="true">
        <div className="wizard-progress-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
