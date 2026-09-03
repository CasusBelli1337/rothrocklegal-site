// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicApiError } from '@/lib/public/api';
import type { ScheduleInvitePublic } from '@/lib/public/contract';
import { SCHEDULE_COPY } from '@/lib/public/copy';
import { SchedulePage } from './SchedulePage';

const api = vi.hoisted(() => ({ fetchInvite: vi.fn(), bookSlot: vi.fn() }));
vi.mock('@/lib/public/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/public/api')>()),
  fetchInvite: api.fetchInvite,
  bookSlot: api.bookSlot,
}));
// The test machine's clock is not Pacific; pin the visitor zone so labels are predictable.
vi.mock('@/lib/public/time', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/public/time')>()),
  browserTimeZone: () => 'America/New_York',
}));

const TOKEN = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-AbCdE';
const far = (days: number, hour: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};
const invite: ScheduleInvitePublic = {
  inviteeName: 'Jane Doe',
  inviteeEmail: 'jane@example.com',
  firmName: 'Rothrock Legal',
  timezone: 'America/Los_Angeles',
  status: 'sent',
  slots: [
    { start: far(3, 17), end: far(3, 17).replace('T17:00', 'T17:45') },
    { start: far(3, 21), end: far(3, 21).replace('T21:00', 'T21:45') },
    { start: far(4, 18), end: far(4, 18).replace('T18:00', 'T18:45') },
  ],
  booked: null,
};

function visit(search: string) {
  window.history.replaceState({}, '', `/schedule/${search}`);
  return render(<SchedulePage />);
}

beforeEach(() => {
  api.fetchInvite.mockReset();
  api.bookSlot.mockReset();
});
afterEach(cleanup);

describe('SchedulePage', () => {
  it('shows the bad-link card for a missing token and for the uniform 404', async () => {
    visit('');
    expect(await screen.findByText(SCHEDULE_COPY.invalid.title)).toBeTruthy();
    cleanup();
    api.fetchInvite.mockRejectedValue(new PublicApiError('This link is not valid or has expired.', 'not-found', 404));
    visit(`?t=${TOKEN}`);
    expect(await screen.findByText(SCHEDULE_COPY.invalid.title)).toBeTruthy();
  });

  it('groups the times by day, notes the visitor zone, and books the chosen one', async () => {
    api.fetchInvite.mockResolvedValue(invite);
    api.bookSlot.mockResolvedValue({
      booked: true,
      start: invite.slots[1].start,
      end: invite.slots[1].end,
      meetLink: 'https://meet.google.com/abc-defg-hij',
    });
    visit(`?t=${TOKEN}`);
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByText(SCHEDULE_COPY.timezone, { exact: false })).toBeTruthy();
    expect(screen.getAllByText(/your time/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: SCHEDULE_COPY.form.button })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^2:00 PM/ }));
    expect(screen.getByText(/You picked/)).toBeTruthy();
    expect((screen.getByLabelText(SCHEDULE_COPY.form.email, { exact: false }) as HTMLInputElement).value).toBe('jane@example.com');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: SCHEDULE_COPY.form.button }));
    });
    expect(await screen.findByRole('link', { name: SCHEDULE_COPY.booked.meet })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/^See you on /);
    expect(screen.getByText(SCHEDULE_COPY.booked.emailed)).toBeTruthy();
    expect(screen.getByText(SCHEDULE_COPY.booked.notLawyersYet)).toBeTruthy();
    expect(screen.getByText(SCHEDULE_COPY.booked.haveReadyGeneric[0])).toBeTruthy();
    expect(api.bookSlot).toHaveBeenCalledWith(TOKEN, {
      start: invite.slots[1].start,
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('refreshes the times when the chosen one was just taken', async () => {
    const fresh = { ...invite, slots: [invite.slots[2]] };
    api.fetchInvite.mockResolvedValueOnce(invite).mockResolvedValueOnce(fresh);
    api.bookSlot.mockRejectedValue(new PublicApiError('That time is no longer open.', 'slot-taken', 409));
    visit(`?t=${TOKEN}`);
    fireEvent.click(await screen.findByRole('button', { name: /^2:00 PM/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: SCHEDULE_COPY.form.button }));
    });
    expect(await screen.findByText(SCHEDULE_COPY.slotTaken)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /^2:00 PM/ })).toBeNull();
    expect(screen.queryByText(/You picked/)).toBeNull();
  });

  it('shows the appointment straight away on a revisited, booked link', async () => {
    api.fetchInvite.mockResolvedValue({
      ...invite,
      status: 'booked',
      booked: { start: invite.slots[0].start, end: invite.slots[0].end, meetLink: null },
    });
    visit(`?t=${TOKEN}`);
    expect(await screen.findByText(SCHEDULE_COPY.booked.noMeet)).toBeTruthy();
    expect(screen.getByText(SCHEDULE_COPY.booked.eyebrow)).toBeTruthy();
  });
});
