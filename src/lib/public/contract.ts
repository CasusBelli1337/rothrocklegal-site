/**
 * Shapes the public service answers with (portal packages/shared/src/schemas
 * signing.ts and schedule.ts). Typed by hand here: the site has no Zod, and
 * the guards below are the only place a wire answer is trusted.
 */

export type SignStatus = 'pending' | 'viewed' | 'signed' | 'declined' | 'void';
export type SignatureKind = 'typed' | 'drawn';

/** GET /sign/:token. */
export interface SignEnvelopePublic {
  documentTitle: string;
  signerName: string;
  firmName: string;
  status: SignStatus;
  pages: number;
  expiresAt: string;
}

/** POST /sign/:token. `signatureText` for typed, `signatureImage` (PNG data URL) for drawn. */
export interface SignSubmit {
  consent: true;
  signatureKind: SignatureKind;
  signatureText?: string;
  signatureImage?: string;
  typedName: string;
}

export interface SignSubmitResponse {
  done: true;
  signedAt: string;
  /** True when another person still has to sign before the copy goes out. */
  nextSigner: boolean;
}

export type ScheduleInviteStatus = 'sent' | 'booked' | 'cancelled' | 'expired';

export interface ScheduleSlot {
  start: string;
  end: string;
}

export interface BookedSlot {
  start: string;
  end: string;
  meetLink: string | null;
}

/** GET /schedule/:token. `inviteeEmail` and `haveReady` are optional extras the page uses when present. */
export interface ScheduleInvitePublic {
  inviteeName: string;
  inviteeEmail?: string;
  firmName: string;
  /** IANA name; every slot is shown in it. */
  timezone: string;
  status: ScheduleInviteStatus;
  slots: ScheduleSlot[];
  booked: BookedSlot | null;
  /** Documents the intake flagged as missing, if the server sends them. */
  haveReady?: string[];
}

/** POST /schedule/:token/book. */
export interface BookRequest {
  start: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface BookResponse {
  booked: true;
  start: string;
  end: string;
  meetLink: string | null;
}

/** The uniform body the public service returns for any link it does not recognize. */
export interface PublicErrorBody {
  error: string;
  code: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isSlot(value: unknown): value is ScheduleSlot {
  return isRecord(value) && isString(value.start) && isString(value.end);
}

function isBooked(value: unknown): value is BookedSlot {
  return (
    isRecord(value) &&
    isString(value.start) &&
    isString(value.end) &&
    (value.meetLink === null || typeof value.meetLink === 'string')
  );
}

export function isPublicErrorBody(value: unknown): value is PublicErrorBody {
  return isRecord(value) && isString(value.error) && isString(value.code);
}

export function isSignEnvelopePublic(value: unknown): value is SignEnvelopePublic {
  return (
    isRecord(value) &&
    isString(value.documentTitle) &&
    isString(value.signerName) &&
    isString(value.firmName) &&
    isString(value.status) &&
    typeof value.pages === 'number' &&
    value.pages > 0 &&
    isString(value.expiresAt)
  );
}

export function isSignSubmitResponse(value: unknown): value is SignSubmitResponse {
  return (
    isRecord(value) &&
    value.done === true &&
    isString(value.signedAt) &&
    typeof value.nextSigner === 'boolean'
  );
}

export function isScheduleInvitePublic(value: unknown): value is ScheduleInvitePublic {
  return (
    isRecord(value) &&
    isString(value.inviteeName) &&
    isString(value.firmName) &&
    isString(value.timezone) &&
    isString(value.status) &&
    Array.isArray(value.slots) &&
    value.slots.every(isSlot) &&
    (value.booked === null || isBooked(value.booked)) &&
    (value.inviteeEmail === undefined || typeof value.inviteeEmail === 'string') &&
    (value.haveReady === undefined ||
      (Array.isArray(value.haveReady) && value.haveReady.every((s) => typeof s === 'string')))
  );
}

export function isBookResponse(value: unknown): value is BookResponse {
  return isRecord(value) && value.booked === true && isBooked(value);
}
