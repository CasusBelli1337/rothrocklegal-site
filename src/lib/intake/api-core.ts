import type { ApiError as ApiErrorShape, IntakeSession } from './contract';

/**
 * The fetch layer every intake call shares (the consult flow in api.ts, the
 * file uploads in api-files.ts, "Add to your request" in api-add.ts).
 * Base URL of the intake API: inlined at build time by Next (the literal
 * `process.env.NEXT_PUBLIC_INTAKE_API` must stay as written). "" = same origin.
 */
export const INTAKE_API_BASE: string = process.env.NEXT_PUBLIC_INTAKE_API ?? '';

export type ApiErrorCode = ApiErrorShape['code'] | 'network' | 'timeout';

export const NETWORK_MESSAGE =
  'We could not reach our server. Check your connection and try again.';
const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again.';

/** Every failure from this client is an ApiError with a message safe to show. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** Who a call speaks for: an intake session, or an addition's own bearer (same shape). */
export type Session = Pick<IntakeSession, 'id' | 'token'>;

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiErrorShape).error === 'string' &&
    typeof (value as ApiErrorShape).code === 'string'
  );
}

export function parseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function toApiError(status: number, body: unknown): ApiError {
  if (isApiErrorShape(body)) return new ApiError(body.error, body.code, status);
  return new ApiError(GENERIC_MESSAGE, 'server-error', status);
}

export function apiUrl(path: string): string {
  return `${INTAKE_API_BASE}${path}`;
}

/** One JSON call; a bearer goes along when a session is given. Throws ApiError on any failure. */
export async function request<T>(path: string, init: RequestInit, session?: Session): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body) headers['Content-Type'] = 'application/json';
  if (session) headers.Authorization = `Bearer ${session.token}`;
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 'network');
  }
  const body = parseJson(await response.text());
  if (!response.ok) throw toApiError(response.status, body);
  return body as T;
}

/** Message to show for any thrown value. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_MESSAGE;
}
