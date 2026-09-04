'use client';

import {
  ACKNOWLEDGMENTS,
  ACKNOWLEDGMENTS_LEGEND,
  ACKNOWLEDGMENT_NOTES,
  AFTER_YOU_SEND,
  BEFORE_WE_START,
  CONFIDENTIALITY_NOTE,
  START_TILES,
} from '@/lib/intake/copy';
import type { IntakeController } from '@/lib/intake/use-intake';
import { CheckboxRow } from './FormFields';
import { StepFrame, StepNav } from './StepFrame';
import type { StepProps } from './step-props';

function Numbered({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-7 shrink-0 place-items-center border border-brass-400 font-serif text-small text-brass-600 tabular"
    >
      {n}
    </span>
  );
}

/** Tile 1: three short lines on what this is. */
function BeforeWeStart() {
  return (
    <>
      <ol className="space-y-3">
        {BEFORE_WE_START.map((line, i) => (
          <li key={line} className="flex gap-3">
            <Numbered n={i + 1} />
            <span className="pt-0.5 text-body text-ink">{line}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-small text-ink-3">{CONFIDENTIALITY_NOTE}</p>
    </>
  );
}

/** Tile 2: the four steps after Send, tight. */
function AfterYouSend() {
  return (
    <ol className="space-y-3">
      {AFTER_YOU_SEND.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <Numbered n={i + 1} />
          <p className="pt-0.5 text-small text-ink-2">
            <span className="font-semibold text-ink">{step.title}</span> {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Tile 3: the three boxes, each with its plain-English gloss in brackets on the same label. */
function Acknowledgments({ intake }: { intake: IntakeController }) {
  const { acks } = intake.state;
  const setAck = (index: number, checked: boolean) =>
    intake.update((s) => {
      const next = [...s.acks] as [boolean, boolean, boolean];
      next[index] = checked;
      return { ...s, acks: next };
    });
  return (
    <fieldset>
      <legend className="text-body font-semibold text-ink">{ACKNOWLEDGMENTS_LEGEND}</legend>
      <div className="mt-3 space-y-3">
        {ACKNOWLEDGMENTS.map((text, i) => (
          <CheckboxRow
            key={text}
            card
            dense
            id={`ack-${i}`}
            checked={acks[i]}
            onChange={(checked) => setAck(i, checked)}
          >
            {text} <span className="text-ink-3">[{ACKNOWLEDGMENT_NOTES[i]}]</span>
          </CheckboxRow>
        ))}
      </div>
    </fieldset>
  );
}

/** Step 0: three compact tiles, one at a time, each with the primary button in the bar. */
export function StepStart({ intake }: StepProps) {
  const { startTile } = intake.state;
  const tile = START_TILES[startTile];
  return (
    <StepFrame
      intake={intake}
      title={tile.title}
      lead={null}
      footer={<StepNav intake={intake} continueLabel={tile.button} />}
    >
      {startTile === 0 && <BeforeWeStart />}
      {startTile === 1 && <AfterYouSend />}
      {startTile === 2 && <Acknowledgments intake={intake} />}
    </StepFrame>
  );
}
