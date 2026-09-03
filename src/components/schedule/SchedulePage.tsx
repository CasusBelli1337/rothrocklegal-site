'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { LoadingCard, NoticeCard, SmallPrint } from '@/components/public/StateCards';
import { PublicShell } from '@/components/public/PublicShell';
import { bookSlot, errorMessage, fetchInvite, isNotFound, isSlotTaken } from '@/lib/public/api';
import type { ScheduleInvitePublic } from '@/lib/public/contract';
import { SCHEDULE_COPY, SHARED_COPY } from '@/lib/public/copy';
import {
  SCHEDULE_INITIAL,
  bookingProblem,
  buildBooking,
  haveReadyList,
  initialForm,
  scheduleReducer,
  type BookingForm as BookingFormValues,
  type ScheduleEvent,
} from '@/lib/public/schedule-state';
import { groupSlotsByDay, upcomingSlots } from '@/lib/public/slots';
import {
  browserTimeZone,
  durationMinutes,
  formatDayLong,
  formatTime,
  formatWhen,
  sameZone,
  zoneLabel,
} from '@/lib/public/time';
import { useToken } from '@/lib/public/use-token';
import { BookedCard } from './BookedCard';
import { BookingForm } from './BookingForm';
import { SlotPicker } from './SlotPicker';

/** Fetches the invitation once the token is known, and again after "Try again". */
function useInvite(
  token: string | null,
  loading: boolean,
  dispatch: React.Dispatch<ScheduleEvent>,
) {
  useEffect(() => {
    if (!token || !loading) return;
    let alive = true;
    fetchInvite(token)
      .then((invite) => alive && dispatch({ type: 'loaded', invite }))
      .catch((error: unknown) => {
        if (!alive) return;
        dispatch(
          isNotFound(error)
            ? { type: 'invalid' }
            : { type: 'load-failed', message: errorMessage(error) },
        );
      });
    return () => {
      alive = false;
    };
  }, [token, loading, dispatch]);
}

/** A booking that lost its slot refreshes the list; anything else is a plain error line. */
async function bookingFailure(token: string, error: unknown): Promise<ScheduleEvent> {
  if (isNotFound(error)) return { type: 'invalid' };
  if (!isSlotTaken(error)) return { type: 'submit-failed', message: errorMessage(error) };
  try {
    return { type: 'slot-taken', invite: await fetchInvite(token) };
  } catch (refreshError) {
    return isNotFound(refreshError)
      ? { type: 'invalid' }
      : { type: 'submit-failed', message: errorMessage(refreshError) };
  }
}

/** The lead under the h1 while times are on offer. */
function ReadyLead({
  invite,
  visitorZone,
}: {
  invite: ScheduleInvitePublic;
  visitorZone: string | null;
}) {
  const first = invite.slots[0];
  const minutes = first ? durationMinutes(first.start, first.end) : 45;
  return (
    <>
      <p>
        {SCHEDULE_COPY.forName} <strong className="text-ink">{invite.inviteeName}</strong>.
      </p>
      <p className="text-body">{SCHEDULE_COPY.intro(minutes)}</p>
      <p className="text-body">
        {SCHEDULE_COPY.timezone}
        {visitorZone && ` ${SCHEDULE_COPY.deviceZone(zoneLabel(visitorZone))}`}
      </p>
    </>
  );
}

/** The /schedule/ page: link check, open times by day, the short form, and the booked screen. */
export function SchedulePage() {
  const tokenState = useToken();
  const token = tokenState.status === 'ok' ? tokenState.token : null;
  const [state, dispatch] = useReducer(scheduleReducer, SCHEDULE_INITIAL);
  const [form, setForm] = useState<BookingFormValues>(initialForm(null));
  const [problem, setProblem] = useState<string | null>(null);
  const seeded = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (tokenState.status === 'missing') dispatch({ type: 'invalid' });
  }, [tokenState.status]);
  useInvite(token, state.phase === 'loading', dispatch);
  useEffect(() => {
    if (state.invite && !seeded.current) {
      seeded.current = true;
      setForm(initialForm(state.invite));
    }
  }, [state.invite]);
  useEffect(() => {
    if (state.phase === 'booked') headingRef.current?.focus();
  }, [state.phase]);

  const submit = async () => {
    if (!token || !state.selected) return;
    const found = bookingProblem(form, state.selected);
    setProblem(found);
    if (found) return;
    dispatch({ type: 'submit' });
    try {
      const result = await bookSlot(token, buildBooking(form, state.selected));
      dispatch({ type: 'booked', result });
    } catch (error) {
      dispatch(await bookingFailure(token, error));
    }
  };

  const { invite } = state;
  const zone = invite?.timezone ?? 'America/Los_Angeles';
  const visitor = browserTimeZone();
  const visitorZone = visitor && !sameZone(visitor, zone) ? visitor : null;
  const picking = state.phase === 'ready' || state.phase === 'booking';
  const groups = invite ? groupSlotsByDay(upcomingSlots(invite.slots), zone, visitorZone) : [];
  const booked = state.phase === 'booked' ? state.booked : null;

  const title = booked
    ? SCHEDULE_COPY.booked.title(formatDayLong(booked.start, zone))
    : SCHEDULE_COPY.title;
  const eyebrow = booked ? SCHEDULE_COPY.booked.eyebrow : SCHEDULE_COPY.eyebrow;
  const lead = booked ? (
    <p>
      {SCHEDULE_COPY.booked.when(formatDayLong(booked.start, zone), formatTime(booked.start, zone))}
      {visitorZone && ` (${formatTime(booked.start, visitorZone)} ${SCHEDULE_COPY.yourTime})`}
    </p>
  ) : (
    picking && invite && <ReadyLead invite={invite} visitorZone={visitorZone} />
  );

  return (
    <PublicShell eyebrow={eyebrow} title={title} lead={lead} headingRef={headingRef}>
      {(state.phase === 'loading' || tokenState.status === 'pending') && (
        <LoadingCard text={SCHEDULE_COPY.loading} />
      )}
      {state.phase === 'invalid' && (
        <NoticeCard
          tone="alert"
          title={SCHEDULE_COPY.invalid.title}
          body={SCHEDULE_COPY.invalid.body}
        />
      )}
      {state.phase === 'error' && (
        <NoticeCard
          tone="alert"
          title={SCHEDULE_COPY.loadFailed}
          body={state.error ?? SHARED_COPY.generic}
          action={{ label: SHARED_COPY.tryAgain, onClick: () => dispatch({ type: 'retry' }) }}
        />
      )}
      {picking && invite && (
        <div className="border border-line bg-white p-5 sm:p-8">
          {state.notice && (
            <p role="status" aria-live="polite" className="wizard-banner mb-6 text-body text-ink">
              {state.notice}
            </p>
          )}
          {groups.length === 0 ? (
            <p className="text-body text-ink">{SCHEDULE_COPY.noSlots}</p>
          ) : (
            <SlotPicker
              groups={groups}
              selected={state.selected}
              onSelect={(start) => dispatch({ type: 'select', start })}
            />
          )}
        </div>
      )}
      {picking && state.selected && (
        <BookingForm
          form={form}
          onChange={(patch) => {
            setProblem(null);
            setForm((current) => ({ ...current, ...patch }));
          }}
          pickedLabel={`${formatWhen(state.selected, zone)}${
            visitorZone
              ? ` (${formatTime(state.selected, visitorZone)} ${SCHEDULE_COPY.yourTime})`
              : ''
          }`}
          onChangeSlot={() => dispatch({ type: 'clear-selection' })}
          busy={state.phase === 'booking'}
          error={problem ?? state.error}
          onSubmit={() => void submit()}
        />
      )}
      {booked && <BookedCard booked={booked} haveReady={haveReadyList(invite)} />}
      <SmallPrint />
    </PublicShell>
  );
}
