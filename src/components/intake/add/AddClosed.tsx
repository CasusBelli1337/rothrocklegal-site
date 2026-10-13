'use client';

import { Button } from '@/components/ui/Button';
import { ADD_ASK_COPY, ADD_CLOSED_COPY } from '@/lib/intake/copy';
import type { AdditionController } from '@/lib/intake/use-addition';
import { AddFrame } from './AddFrame';

/** The request cannot take more: too old or declined (closed), or added to often lately (limit). */
export function AddClosed({ add }: { add: AdditionController }) {
  const { state } = add;
  const closed = state.phase === 'closed';
  return (
    <AddFrame title={closed ? ADD_CLOSED_COPY.closedTitle : ADD_CLOSED_COPY.limitTitle}>
      <p className="max-w-[62ch] text-body text-ink">
        {closed ? ADD_CLOSED_COPY.closedBody : (state.error ?? ADD_CLOSED_COPY.limitFallback)}
      </p>
      <div className="mt-6">
        <Button href="/request-a-consult/" variant="secondary">
          {ADD_ASK_COPY.startNew}
        </Button>
      </div>
    </AddFrame>
  );
}
