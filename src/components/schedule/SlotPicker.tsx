'use client';

import { useState } from 'react';
import { SCHEDULE_COPY } from '@/lib/public/copy';
import type { DayGroup, SlotView } from '@/lib/public/slots';

/** Days shown before "Show more days" (long lists collapse after five). */
export const DAYS_SHOWN = 5;

interface SlotPickerProps {
  groups: DayGroup[];
  selected: string | null;
  onSelect(start: string): void;
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: SlotView;
  selected: boolean;
  onSelect(): void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-12 flex-col items-center justify-center border px-3 py-2 text-body font-medium tabular transition-colors ${
        selected
          ? 'border-maroon-700 bg-sand text-ink ring-1 ring-maroon-700'
          : 'border-line-strong bg-white text-ink hover:border-maroon-500'
      }`}
    >
      <span>{slot.label}</span>
      {slot.localLabel && (
        <span className="whitespace-nowrap text-meta font-normal text-ink-3">
          {slot.localLabel} {SCHEDULE_COPY.yourTime}
        </span>
      )}
    </button>
  );
}

/** Open times grouped by day, five days at a time. */
export function SlotPicker({ groups, selected, onSelect }: SlotPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? groups : groups.slice(0, DAYS_SHOWN);
  const hidden = groups.length - shown.length;
  return (
    <div className="space-y-8">
      {shown.map((day) => (
        <section key={day.key} aria-labelledby={`day-${day.key}`}>
          <h3 id={`day-${day.key}`} className="font-sans text-h4 text-ink">
            {day.label}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {day.slots.map((slot) => (
              <SlotButton
                key={slot.start}
                slot={slot}
                selected={slot.start === selected}
                onSelect={() => onSelect(slot.start)}
              />
            ))}
          </div>
        </section>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="tap-link text-body font-medium text-ink underline underline-offset-3 hover:text-maroon-700"
        >
          Show {hidden} more {hidden === 1 ? 'day' : 'days'}
        </button>
      )}
    </div>
  );
}
