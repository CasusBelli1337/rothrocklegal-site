import {
  isBookResponse,
  isPublicErrorBody,
  isScheduleInvitePublic,
  isSignEnvelopePublic,
  isSignSubmitResponse,
  type BookRequest,
  type BookResponse,
  type ScheduleInvitePublic,
  type SignEnvelopePublic,
  type SignSubmit,
  type SignSubmitResponse,
} from './contract';

/**
 * The public service sits behind the intake module's pass-through:
 * https://intake.rothrocklegal.com/api/intake/public/* in production, the same
 * origin in the editor preview. The literal `process.env.NEXT_PUBLIC_INTAKE_API`
 * must stay as written so Next inlines it at build time.
 */
export const PUBLIC_API_BASE: string = `${process.env.NEXT_PUBLIC_INTAKE_API ?? ''}/api/intake/public`;

/** `?t=<token>` on /sign/ and /schedule/. */
export const TOKEN_PARAM = 't';
export const GET_TIMEOUT_MS = 15_000;
export const POST_TIMEOUT_MS = 30_000;

export type PublicApiCode = 'not-found' | 'network' | 'timeout' | 'server-error' | string;

export const NETWORK_MESSAGE = 'We could not reach our server. Check your connection and try again.';
export const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again.';

/** Every failure from this client is a PublicApiError with a message safe to show. */
export class PublicApiError extends Error {
  readonly code: PublicApiCode;
  readonly status: number;

  constructor(message: string, code: PublicApiCode, status = 0) {
    super(message);
    this.name = 'PublicApiError';
    this.code = code;
    this.status = status;
  }
}

/** The token from the address bar, or null when the URL carries none. */
export function readToken(search: string): string | null {
  const token = new URLSearchParams(search).get(TOKEN_PARAM)?.trim();
  return token ? token : null;
}

/** Base64url text of a sensible length; anything else is treated as a bad link without a request. */
export function isWellFormedToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{20,128}$/.test(value);
}

function parseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toError(status: number, body: unknown): PublicApiError {
  if (status === 404) return new PublicApiError('This link is not valid or has expired.', 'not-found', 404);
  if (isPublicErrorBody(body) && status < 500) return new PublicApiError(body.error, body.code, status);
  return new PublicApiError(GENERIC_MESSAGE, 'server-error', status);
}

async function request<T>(
  path: string,
  init: RequestInit,
  guard: (value: unknown) => value is T,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body) headers['Content-Type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_API_BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new PublicApiError(NETWORK_MESSAGE, timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
  const body = parseJson(await response.text());
  if (!response.ok) throw toError(response.status, body);
  if (!guard(body)) throw new PublicApiError(GENERIC_MESSAGE, 'server-error', response.status);
  return body;
}

function tokenPath(prefix: string, token: string, suffix = ''): string {
  return `${prefix}/${encodeURIComponent(token)}${suffix}`;
}

/** Where the page fetches the agreement itself (streamed inline by the public service). */
export function signPdfUrl(token: string): string {
  return `${PUBLIC_API_BASE}${tokenPath('/sign', token, '/pdf')}`;
}

export function fetchEnvelope(token: string): Promise<SignEnvelopePublic> {
  return request(tokenPath('/sign', token), { method: 'GET' }, isSignEnvelopePublic, GET_TIMEOUT_MS);
}

export function submitSignature(token: string, body: SignSubmit): Promise<SignSubmitResponse> {
  return request(
    tokenPath('/sign', token),
    { method: 'POST', body: JSON.stringify(body) },
    isSignSubmitResponse,
    POST_TIMEOUT_MS,
  );
}

export function fetchInvite(token: string): Promise<ScheduleInvitePublic> {
  return request(
    tokenPath('/schedule', token),
    { method: 'GET' },
    isScheduleInvitePublic,
    GET_TIMEOUT_MS,
  );
}

export function bookSlot(token: string, body: BookRequest): Promise<BookResponse> {
  return request(
    tokenPath('/schedule', token, '/book'),
    { method: 'POST', body: JSON.stringify(body) },
    isBookResponse,
    POST_TIMEOUT_MS,
  );
}

/** Message to show for any thrown value. */
export function errorMessage(error: unknown): string {
  return error instanceof PublicApiError ? error.message : GENERIC_MESSAGE;
}

/** The uniform "not valid or expired" answer, whatever the reason behind it. */
export function isNotFound(error: unknown): boolean {
  return error instanceof PublicApiError && error.code === 'not-found';
}

/** A booking that lost the race for its slot; the server says so with a 409. */
export function isSlotTaken(error: unknown): boolean {
  return error instanceof PublicApiError && error.status === 409;
}
