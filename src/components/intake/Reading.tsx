import { CheckIcon } from '@/components/icons';
import { EVALUATION_WAIT } from '@/lib/intake/copy';
import { EVALUATION_STAGES, stageIndex, type EvaluationPhase } from '@/lib/intake/use-evaluation';

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"
    />
  );
}

/** One line with a small spinner while the server reads the story (pass 1). */
export function ReadingLine({ text }: { text: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center gap-3 text-body font-medium text-ink"
    >
      <Spinner />
      {text}
    </p>
  );
}

/** The three status lines that move while the server reads the intake (pass 2). */
export function EvaluationStages({ phase }: { phase: EvaluationPhase }) {
  const active = stageIndex(phase) ?? -1;
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <ol className="space-y-3">
        {EVALUATION_STAGES.map((line, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={line}
              className={`flex items-center gap-3 text-body ${current ? 'font-semibold text-ink' : done ? 'text-ink-2' : 'text-ink-4'}`}
            >
              {done ? (
                <CheckIcon className="h-5 w-5 text-success" />
              ) : current ? (
                <Spinner />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full border border-line-strong"
                />
              )}
              {line}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-small text-ink-3">{EVALUATION_WAIT}</p>
    </div>
  );
}
