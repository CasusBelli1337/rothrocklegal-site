import type {
  ApiError as ApiErrorShape,
  CreateIntakeResponse,
  EvaluateResponse,
  FollowUpAnswer,
  IntakeAnswers,
  IntakeFile,
  IntakeSession,
  LookupResponse,
  ResumeResponse,
  SaveAnswersResponse,
  SubmitResponse,
  UploadFileResponse,
} from './contract';

/**
 * Base URL of the intake API. Inlined at build time by Next (the literal
 * `process.env.NEXT_PUBLIC_INTAKE_API` must stay as written). "" = same origin.
 */
export const INTAKE_API_BASE: string = process.env.NEXT_PUBLIC_INTAKE_API ?? '';

export const HEALTH_PATH = '/api/intake/health';
export const LOOKUP_PATH = '/api/intake/lookup';
export const RESUME_PATH = '/api/intake/resume';
export const PING_TIMEOUT_MS = 4000;
export const LOOKUP_TIMEOUT_MS = 4000;

export type ApiErrorCode = ApiErrorShape['code'] | 'network' | 'timeout';

const NETWORK_MESSAGE = 'We could not reach our server. Check your connection and try again.';
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

export type Session = Pick<IntakeSession, 'id' | 'token'>;

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiErrorShape).error === 'string' &&
    typeof (value as ApiErrorShape).code === 'string'
  );
}

function parseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toApiError(status: number, body: unknown): ApiError {
  if (isApiErrorShape(body)) return new ApiError(body.error, body.code, status);
  return new ApiError(GENERIC_MESSAGE, 'server-error', status);
}

function url(path: string): string {
  return `${INTAKE_API_BASE}${path}`;
}

async function request<T>(path: string, init: RequestInit, session?: Session): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body) headers['Content-Type'] = 'application/json';
  if (session) headers.Authorization = `Bearer ${session.token}`;
  let response: Response;
  try {
    response = await fetch(url(path), { ...init, headers });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 'network');
  }
  const body = parseJson(await response.text());
  if (!response.ok) throw toApiError(response.status, body);
  return body as T;
}

/** True when the API answers `/api/intake/health` within the timeout. */
export async function ping(timeoutMs = PING_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url(HEALTH_PATH), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return false;
    const body = parseJson(await response.text());
    return typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * "Continue by email": true when an unfinished request exists for the address
 * (the server then emails that address a link). Every failure, including a
 * server without this endpoint, a lost connection, or a slow answer, is
 * false, so the contact step never blocks on it. The current session's token
 * goes along when there is one so the server can leave out this very request.
 */
export async function lookupEmail(
  email: string,
  session?: Session | null,
  timeoutMs = LOOKUP_TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const body = await request<LookupResponse | undefined>(
      LOOKUP_PATH,
      { method: 'POST', body: JSON.stringify({ email }), signal: controller.signal },
      session ?? undefined,
    );
    return body?.found === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Exchanges the token from an emailed link for the earlier request. Throws ApiError when it is spent or expired. */
export function resumeIntake(token: string): Promise<ResumeResponse> {
  return request<ResumeResponse>(RESUME_PATH, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function createIntake(): Promise<CreateIntakeResponse> {
  return request<CreateIntakeResponse>('/api/intake', {
    method: 'POST',
    body: '{}',
  });
}

export function saveAnswers(
  session: Session,
  answers: Partial<IntakeAnswers>,
): Promise<SaveAnswersResponse> {
  return request<SaveAnswersResponse>(
    `/api/intake/${session.id}/answers`,
    { method: 'PUT', body: JSON.stringify({ answers }) },
    session,
  );
}

export async function deleteFile(session: Session, fileId: string): Promise<void> {
  await request<{ ok: true }>(
    `/api/intake/${session.id}/files/${fileId}`,
    { method: 'DELETE' },
    session,
  );
}

/** Starts (or re-requests, idempotently) the evaluation. 202 while it runs. */
export function startEvaluation(session: Session): Promise<EvaluateResponse> {
  return request<EvaluateResponse>(
    `/api/intake/${session.id}/evaluate`,
    { method: 'POST', body: '{}' },
    session,
  );
}

export function getEvaluation(session: Session): Promise<EvaluateResponse> {
  return request<EvaluateResponse>(
    `/api/intake/${session.id}/evaluation`,
    { method: 'GET' },
    session,
  );
}

export async function saveFollowUp(
  session: Session,
  answers: Record<string, FollowUpAnswer>,
): Promise<void> {
  await request<{ ok: true }>(
    `/api/intake/${session.id}/follow-up`,
    { method: 'PUT', body: JSON.stringify({ answers }) },
    session,
  );
}

export function submitIntake(session: Session): Promise<SubmitResponse> {
  return request<SubmitResponse>(
    `/api/intake/${session.id}/submit`,
    { method: 'POST', body: '{}' },
    session,
  );
}

export interface UploadHandle {
  promise: Promise<IntakeFile>;
  abort(): void;
}

function isUploadResponse(value: unknown): value is UploadFileResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as UploadFileResponse).file === 'object'
  );
}

/** Multipart upload over XMLHttpRequest so the browser reports progress events. */
export function uploadFile(
  session: Session,
  slot: string,
  file: File,
  onProgress?: (percent: number) => void,
): UploadHandle {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<IntakeFile>((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress)
        onProgress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener('load', () => {
      const body = parseJson(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300 && isUploadResponse(body)) resolve(body.file);
      else reject(toApiError(xhr.status, body));
    });
    xhr.addEventListener('error', () => reject(new ApiError(NETWORK_MESSAGE, 'network')));
    xhr.addEventListener('abort', () => reject(new ApiError('Upload cancelled.', 'network')));
    xhr.open('POST', url(`/api/intake/${session.id}/files`));
    xhr.setRequestHeader('Authorization', `Bearer ${session.token}`);
    xhr.setRequestHeader('Accept', 'application/json');
    const form = new FormData();
    form.append('slot', slot);
    form.append('file', file, file.name);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}

/** Message to show for any thrown value. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_MESSAGE;
}
