'use client';

import Link from 'next/link';
import {
  ACKNOWLEDGMENTS,
  ACKNOWLEDGMENTS_LEGEND,
  ACKNOWLEDGMENT_NOTES,
  HOW_THIS_WORKS,
  START_TILES,
  WHAT_WE_DO,
  WHAT_YOU_GET,
  WHY_UP_FRONT,
  type TakeAway,
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

/** Tile 1: the process and what we ask for, then why we ask so much. */
function HowThisWorks() {
  return (
    <>
      <ol className="space-y-3">
        {HOW_THIS_WORKS.map((line, i) => (
          <li key={line} className="flex gap-3">
            <Numbered n={i + 1} />
            <span className="pt-0.5 text-body text-ink">{line}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-small text-ink-2">{WHY_UP_FRONT}</p>
    </>
  );
}

function TakeAwayText({ item }: { item: TakeAway }) {
  const { link } = item;
  return (
    <p className="text-small text-ink-2">
      <span className="font-semibold text-ink">{item.title}</span> {item.body}
      {link && (
        <>
          {' '}
          {link.before}
          <Link
            href={link.href}
            className="text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
          >
            {link.label}
          </Link>
          {link.after}
        </>
      )}
    </p>
  );
}

/** Tile 2: what the person gets at the end, whether or not we take the case. */
function WhatYouGet() {
  return (
    <ul className="space-y-4">
      {WHAT_YOU_GET.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 bg-brass-400" />
          <TakeAwayText item={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Tile 3: what we do with what is sent, then the three boxes, each with its
 * plain-English gloss in brackets. Spacing is a notch tighter than elsewhere so
 * the two lines and the statements still fit a 1366x768 screen.
 */
function WhatWeDo({ intake }: { intake: IntakeController }) {
  const { acks } = intake.state;
  const setAck = (index: number, checked: boolean) =>
    intake.update((s) => {
      const next = [...s.acks] as [boolean, boolean, boolean];
      next[index] = checked;
      return { ...s, acks: next };
    });
  return (
    <>
      <div className="space-y-2">
        {WHAT_WE_DO.map((line) => (
          <p key={line} className="text-small text-ink-2">
            {line}
          </p>
        ))}
      </div>
      <fieldset className="mt-4">
        <legend className="text-body font-semibold text-ink">{ACKNOWLEDGMENTS_LEGEND}</legend>
        <div className="mt-2 space-y-2">
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
    </>
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
      {startTile === 0 && <HowThisWorks />}
      {startTile === 1 && <WhatYouGet />}
      {startTile === 2 && <WhatWeDo intake={intake} />}
    </StepFrame>
  );
}
