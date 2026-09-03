import type { BookRequest, BookResponse, BookedSlot, ScheduleInvitePublic } from './contract';
import { SCHEDULE_COPY } from './copy';

/** The /schedule/ page as a pure state machine; the component dispatches and renders. */
export type SchedulePhase = 'loading' | 'invalid' | 'error' | 'ready' | 'booking' | 'booked';

export interface ScheduleState {
  phase: SchedulePhase;
  invite: ScheduleInvitePublic | null;
  /** ISO start of the chosen slot. */
  selected: string | null;
  booked: BookedSlot | null;
  /** A calm line above the picker (the slot-taken notice). */
  notice: string | null;
  error: string | null;
}

export type ScheduleEvent =
  | { type: 'loaded'; invite: ScheduleInvitePublic }
  | { type: 'invalid' }
  | { type: 'load-failed'; message: string }
  | { type: 'retry' }
  | { type: 'select'; start: string }
  | { type: 'clear-selection' }
  | { type: 'submit' }
  | { type: 'booked'; result: BookResponse }
  | { type: 'slot-taken'; invite: ScheduleInvitePublic }
  | { type: 'submit-failed'; message: string };

export const SCHEDULE_INITIAL: ScheduleState = {
  phase: 'loading',
  invite: null,
  selected: null,
  booked: null,
  notice: null,
  error: null,
};

function fromInvite(invite: ScheduleInvitePublic, notice: string | null): ScheduleState {
  if (invite.booked) return { ...SCHEDULE_INITIAL, phase: 'booked', invite, booked: invite.booked };
  if (invite.status === 'cancelled' || invite.status === 'expired') {
    return { ...SCHEDULE_INITIAL, phase: 'invalid' };
  }
  return { ...SCHEDULE_INITIAL, phase: 'ready', invite, notice };
}

export function scheduleReducer(state: ScheduleState, event: ScheduleEvent): ScheduleState {
  switch (event.type) {
    case 'loaded':
      return fromInvite(event.invite, null);
    case 'invalid':
      return { ...SCHEDULE_INITIAL, phase: 'invalid' };
    case 'load-failed':
      return { ...SCHEDULE_INITIAL, phase: 'error', error: event.message };
    case 'retry':
      return state.phase === 'error' ? SCHEDULE_INITIAL : state;
    case 'select':
      return state.phase === 'ready'
        ? { ...state, selected: event.start, notice: null, error: null }
        : state;
    case 'clear-selection':
      return state.phase === 'ready' ? { ...state, selected: null, error: null } : state;
    case 'submit':
      return state.phase === 'ready' && state.selected
        ? { ...state, phase: 'booking', error: null }
        : state;
    case 'booked':
      return {
        ...state,
        phase: 'booked',
        booked: { start: event.result.start, end: event.result.end, meetLink: event.result.meetLink },
        error: null,
      };
    case 'slot-taken':
      return fromInvite(event.invite, SCHEDULE_COPY.slotTaken);
    case 'submit-failed':
      return state.phase === 'booking' ? { ...state, phase: 'ready', error: event.message } : state;
  }
}

/** The short form under the slots. */
export interface BookingForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export function initialForm(invite: ScheduleInvitePublic | null): BookingForm {
  return { name: invite?.inviteeName ?? '', email: invite?.inviteeEmail ?? '', phone: '', notes: '' };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The first plain-English problem, or null when the booking can be sent. */
export function bookingProblem(form: BookingForm, selected: string | null): string | null {
  if (!selected) return SCHEDULE_COPY.problems.slot;
  if (!form.name.trim()) return SCHEDULE_COPY.problems.name;
  if (!EMAIL.test(form.email.trim())) return SCHEDULE_COPY.problems.email;
  return null;
}

export function buildBooking(form: BookingForm, start: string): BookRequest {
  const body: BookRequest = { start, name: form.name.trim(), email: form.email.trim() };
  if (form.phone.trim()) body.phone = form.phone.trim();
  if (form.notes.trim()) body.notes = form.notes.trim();
  return body;
}

/** What to bring: the intake's missing documents when the server sends them, the general list otherwise. */
export function haveReadyList(invite: ScheduleInvitePublic | null): readonly string[] {
  const fromIntake = invite?.haveReady?.map((s) => s.trim()).filter(Boolean) ?? [];
  return fromIntake.length > 0 ? fromIntake : SCHEDULE_COPY.booked.haveReadyGeneric;
}
