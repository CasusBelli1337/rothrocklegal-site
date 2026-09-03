import { describe, expect, it } from 'vitest';
import type { ScheduleInvitePublic } from './contract';
import { SCHEDULE_COPY } from './copy';
import {
  SCHEDULE_INITIAL,
  bookingProblem,
  buildBooking,
  haveReadyList,
  initialForm,
  scheduleReducer,
  type ScheduleEvent,
  type ScheduleState,
} from './schedule-state';

const invite: ScheduleInvitePublic = {
  inviteeName: 'Jane Doe',
  inviteeEmail: 'jane@example.com',
  firmName: 'Rothrock Legal',
  timezone: 'America/Los_Angeles',
  status: 'sent',
  slots: [{ start: '2026-09-09T21:00:00.000Z', end: '2026-09-09T21:45:00.000Z' }],
  booked: null,
};
const START = '2026-09-09T21:00:00.000Z';

function run(events: ScheduleEvent[], from: ScheduleState = SCHEDULE_INITIAL): ScheduleState {
  return events.reduce(scheduleReducer, from);
}

describe('schedule page state machine', () => {
  it('offers times for a live invitation and the appointment for a booked one', () => {
    expect(run([{ type: 'loaded', invite }]).phase).toBe('ready');
    const booked = { start: START, end: '2026-09-09T21:45:00.000Z', meetLink: 'https://meet.google.com/abc' };
    const revisit = run([{ type: 'loaded', invite: { ...invite, status: 'booked', booked } }]);
    expect(revisit.phase).toBe('booked');
    expect(revisit.booked).toEqual(booked);
  });

  it('treats a cancelled or expired invitation as a dead link', () => {
    expect(run([{ type: 'loaded', invite: { ...invite, status: 'cancelled' } }]).phase).toBe('invalid');
    expect(run([{ type: 'loaded', invite: { ...invite, status: 'expired' } }]).phase).toBe('invalid');
  });

  it('selects, clears, and refuses to submit without a time', () => {
    const ready = run([{ type: 'loaded', invite }]);
    expect(run([{ type: 'submit' }], ready).phase).toBe('ready');
    const picked = run([{ type: 'select', start: START }], ready);
    expect(picked.selected).toBe(START);
    expect(run([{ type: 'clear-selection' }], picked).selected).toBeNull();
    expect(run([{ type: 'submit' }], picked).phase).toBe('booking');
  });

  it('books, or explains a lost slot and shows the fresh list', () => {
    const booking = run([{ type: 'loaded', invite }, { type: 'select', start: START }, { type: 'submit' }]);
    const result = { booked: true as const, start: START, end: '2026-09-09T21:45:00.000Z', meetLink: null };
    expect(run([{ type: 'booked', result }], booking)).toMatchObject({
      phase: 'booked',
      booked: { start: START, meetLink: null },
    });
    const fresh = { ...invite, slots: [{ start: '2026-09-10T17:00:00.000Z', end: '2026-09-10T17:45:00.000Z' }] };
    const taken = run([{ type: 'slot-taken', invite: fresh }], booking);
    expect(taken.phase).toBe('ready');
    expect(taken.selected).toBeNull();
    expect(taken.notice).toBe(SCHEDULE_COPY.slotTaken);
    expect(taken.invite?.slots).toEqual(fresh.slots);
    expect(run([{ type: 'select', start: START }], taken).notice).toBeNull();
  });

  it('returns to the form with the message when booking fails', () => {
    const booking = run([{ type: 'loaded', invite }, { type: 'select', start: START }, { type: 'submit' }]);
    const failed = run([{ type: 'submit-failed', message: 'Offline.' }], booking);
    expect(failed.phase).toBe('ready');
    expect(failed.selected).toBe(START);
    expect(failed.error).toBe('Offline.');
  });

  it('retries only from a failed load', () => {
    const failed = run([{ type: 'load-failed', message: 'Offline.' }]);
    expect(run([{ type: 'retry' }], failed)).toEqual(SCHEDULE_INITIAL);
  });
});

describe('booking form', () => {
  it('prefills the name and email from the invitation', () => {
    expect(initialForm(invite)).toEqual({ name: 'Jane Doe', email: 'jane@example.com', phone: '', notes: '' });
    expect(initialForm({ ...invite, inviteeEmail: undefined }).email).toBe('');
    expect(initialForm(null).name).toBe('');
  });

  it('names the first problem and builds the request without empty optionals', () => {
    const form = initialForm(invite);
    expect(bookingProblem(form, null)).toMatch(/choose a time/);
    expect(bookingProblem({ ...form, name: '' }, START)).toMatch(/enter your name/);
    expect(bookingProblem({ ...form, email: 'nope' }, START)).toMatch(/email address/);
    expect(bookingProblem(form, START)).toBeNull();
    expect(buildBooking({ ...form, phone: ' ', notes: ' Call me. ' }, START)).toEqual({
      start: START,
      name: 'Jane Doe',
      email: 'jane@example.com',
      notes: 'Call me.',
    });
  });

  it('lists the intake documents when the server sends them, else the general list', () => {
    expect(haveReadyList({ ...invite, haveReady: ['The 2019 trust', ' '] })).toEqual(['The 2019 trust']);
    expect(haveReadyList(invite)).toBe(SCHEDULE_COPY.booked.haveReadyGeneric);
    expect(haveReadyList(null).length).toBe(4);
  });
});
