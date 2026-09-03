import { describe, expect, it } from 'vitest';
import {
  isBookResponse,
  isPublicErrorBody,
  isScheduleInvitePublic,
  isSignEnvelopePublic,
  isSignSubmitResponse,
} from './contract';

const envelope = {
  documentTitle: 'Engagement Agreement',
  signerName: 'Jane Doe',
  firmName: 'Rothrock Legal',
  status: 'pending',
  pages: 7,
  expiresAt: '2026-09-10T00:00:00.000Z',
};

const invite = {
  inviteeName: 'Jane Doe',
  firmName: 'Rothrock Legal',
  timezone: 'America/Los_Angeles',
  status: 'sent',
  slots: [{ start: '2026-09-09T21:00:00.000Z', end: '2026-09-09T21:45:00.000Z' }],
  booked: null,
};

describe('public contract guards', () => {
  it('accepts a well-formed envelope and rejects a short one', () => {
    expect(isSignEnvelopePublic(envelope)).toBe(true);
    expect(isSignEnvelopePublic({ ...envelope, pages: 0 })).toBe(false);
    expect(isSignEnvelopePublic({ ...envelope, signerName: '' })).toBe(false);
    expect(isSignEnvelopePublic(null)).toBe(false);
  });

  it('accepts the signing answer only when done is literally true', () => {
    expect(isSignSubmitResponse({ done: true, signedAt: '2026-09-03T23:12:00Z', nextSigner: false })).toBe(true);
    expect(isSignSubmitResponse({ done: false, signedAt: '2026-09-03T23:12:00Z', nextSigner: false })).toBe(false);
    expect(isSignSubmitResponse({ done: true, signedAt: '2026-09-03T23:12:00Z' })).toBe(false);
  });

  it('accepts an invitation with or without the optional extras', () => {
    expect(isScheduleInvitePublic(invite)).toBe(true);
    expect(isScheduleInvitePublic({ ...invite, inviteeEmail: 'jane@example.com', haveReady: ['The trust'] })).toBe(true);
    expect(isScheduleInvitePublic({ ...invite, booked: { start: 'a', end: 'b', meetLink: null } })).toBe(true);
    expect(isScheduleInvitePublic({ ...invite, slots: [{ start: 'x' }] })).toBe(false);
    expect(isScheduleInvitePublic({ ...invite, haveReady: [1] })).toBe(false);
    expect(isScheduleInvitePublic({ ...invite, timezone: '' })).toBe(false);
  });

  it('accepts a booking answer and the uniform error body', () => {
    expect(isBookResponse({ booked: true, start: 'a', end: 'b', meetLink: 'https://meet.google.com/abc' })).toBe(true);
    expect(isBookResponse({ booked: true, start: 'a', end: 'b' })).toBe(false);
    expect(isPublicErrorBody({ error: 'This link is not valid or has expired.', code: 'not-found' })).toBe(true);
    expect(isPublicErrorBody({ error: '' })).toBe(false);
  });
});
