'use client';

import {
  ACKNOWLEDGMENTS,
  ACKNOWLEDGMENT_NOTES,
  CONFIDENTIALITY_NOTE,
  HOW_IT_WORKS,
  NOT_YOUR_LAWYERS_YET,
  REMOTE_NOTE,
} from '@/lib/intake/copy';
import { CheckboxRow } from './FormFields';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

/** Step 0: what happens, the fully-remote note, and the three boxes to tick, each explained. */
export function StepStart({ intake }: StepProps) {
  const { acks } = intake.state;
  const setAck = (index: number, checked: boolean) =>
    intake.update((s) => {
      const next = [...s.acks] as [boolean, boolean, boolean];
      next[index] = checked;
      return { ...s, acks: next };
    });

  return (
    <StepFrame intake={intake} footer={<StepNav intake={intake} continueLabel="Start" />}>
      <ol className="space-y-3">
        {HOW_IT_WORKS.map((line, i) => (
          <li key={line} className="flex gap-4">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center border border-brass-400 font-serif text-base text-brass-600 tabular"
            >
              {i + 1}
            </span>
            <span className="pt-1 text-body text-ink-2">{line}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-body text-ink">
        <strong>{REMOTE_NOTE}</strong> You can do this from your kitchen table, and stop and come
        back later. It saves as you go.
      </p>
      <fieldset className="mt-8">
        <legend className="text-body font-semibold text-ink">Please tick all three boxes</legend>
        <p className="mt-1 text-small text-ink-3">{NOT_YOUR_LAWYERS_YET}</p>
        <div className="mt-3 space-y-4">
          {ACKNOWLEDGMENTS.map((text, i) => (
            <div key={text}>
              <CheckboxRow
                card
                id={`ack-${i}`}
                checked={acks[i]}
                onChange={(checked) => setAck(i, checked)}
              >
                {text}
              </CheckboxRow>
              <p className="mt-1.5 pl-4 text-small text-ink-3">{ACKNOWLEDGMENT_NOTES[i]}</p>
            </div>
          ))}
        </div>
      </fieldset>
      <p className="mt-6 text-small text-ink-3">{CONFIDENTIALITY_NOTE}</p>
    </StepFrame>
  );
}
