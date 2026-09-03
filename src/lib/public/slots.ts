import type { ScheduleSlot } from './contract';
import { dayKey, formatDayLong, formatTime } from './time';

export interface SlotView extends ScheduleSlot {
  /** "2:00 PM" in the firm's zone. */
  label: string;
  /** The same moment on the visitor's clock, when their zone differs; otherwise null. */
  localLabel: string | null;
}

export interface DayGroup {
  key: string;
  /** "Tuesday, September 9". */
  label: string;
  slots: SlotView[];
}

/** Drops slots that have already started; the server only sends future ones, but a page can sit open. */
export function upcomingSlots(slots: readonly ScheduleSlot[], now: Date = new Date()): ScheduleSlot[] {
  return slots.filter((slot) => new Date(slot.start).getTime() > now.getTime());
}

/** Slots grouped by calendar day in `zone`, days and times in order. */
export function groupSlotsByDay(
  slots: readonly ScheduleSlot[],
  zone: string,
  visitorZone: string | null = null,
): DayGroup[] {
  const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  const groups = new Map<string, DayGroup>();
  for (const slot of sorted) {
    const key = dayKey(slot.start, zone);
    const group = groups.get(key) ?? { key, label: formatDayLong(slot.start, zone), slots: [] };
    group.slots.push({
      ...slot,
      label: formatTime(slot.start, zone),
      localLabel: visitorZone ? formatTime(slot.start, visitorZone) : null,
    });
    groups.set(key, group);
  }
  return [...groups.values()];
}

export function findSlot(slots: readonly ScheduleSlot[], start: string): ScheduleSlot | null {
  return slots.find((slot) => slot.start === start) ?? null;
}
