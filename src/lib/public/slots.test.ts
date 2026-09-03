import { describe, expect, it } from 'vitest';
import { findSlot, groupSlotsByDay, upcomingSlots } from './slots';

const LA = 'America/Los_Angeles';
const slots = [
  { start: '2026-09-10T17:00:00.000Z', end: '2026-09-10T17:45:00.000Z' }, // Thu 10:00 AM
  { start: '2026-09-09T21:00:00.000Z', end: '2026-09-09T21:45:00.000Z' }, // Wed 2:00 PM
  { start: '2026-09-09T18:00:00.000Z', end: '2026-09-09T18:45:00.000Z' }, // Wed 11:00 AM
];

describe('slot grouping', () => {
  it('groups by day in the firm zone with days and times in order', () => {
    const groups = groupSlotsByDay(slots, LA);
    expect(groups.map((g) => g.label)).toEqual(['Wednesday, September 9', 'Thursday, September 10']);
    expect(groups[0].slots.map((s) => s.label)).toEqual(['11:00 AM', '2:00 PM']);
    expect(groups[0].slots[0].localLabel).toBeNull();
  });

  it('adds the visitor clock when their zone differs', () => {
    const groups = groupSlotsByDay(slots, LA, 'America/New_York');
    expect(groups[0].slots[1].localLabel).toBe('5:00 PM');
  });

  it('drops slots that already started', () => {
    const now = new Date('2026-09-09T20:00:00.000Z');
    expect(upcomingSlots(slots, now).map((s) => s.start)).toEqual([
      '2026-09-10T17:00:00.000Z',
      '2026-09-09T21:00:00.000Z',
    ]);
  });

  it('finds a slot by its start', () => {
    expect(findSlot(slots, '2026-09-09T21:00:00.000Z')?.end).toBe('2026-09-09T21:45:00.000Z');
    expect(findSlot(slots, 'nope')).toBeNull();
  });
});
