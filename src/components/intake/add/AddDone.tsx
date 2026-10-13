'use client';

import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { ADD_DONE_COPY } from '@/lib/intake/copy';
import type { AdditionController } from '@/lib/intake/use-addition';
import { AddFrame } from './AddFrame';

/** "Added to your request": what was added, then what happens next in three short lines. */
export function AddDone({ add }: { add: AdditionController }) {
  const result = add.state.result;
  return (
    <AddFrame title={ADD_DONE_COPY.title}>
      {result && (
        <div className="border border-line bg-paper p-5 sm:p-6">
          <p className="eyebrow">Your reference number</p>
          <p className="mt-2 font-serif text-h1 text-ink tabular">{result.reference}</p>
          <p className="mt-3 text-body text-ink-2">
            {ADD_DONE_COPY.body(result.reference, result.files, result.withNote)}
          </p>
        </div>
      )}
      <ol className="mt-8 space-y-3">
        {ADD_DONE_COPY.next.map((line) => (
          <li key={line} className="flex items-start gap-3 text-body text-ink">
            <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-success" />
            {line}
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <Button variant="secondary" onClick={add.startAgain}>
          {ADD_DONE_COPY.again}
        </Button>
      </div>
    </AddFrame>
  );
}
