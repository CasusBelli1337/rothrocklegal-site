import type {
  CreateIntakeResponse,
  EvaluateResponse,
  FollowUpAnswer,
  IntakeAnswers,
  LookupResponse,
  PackageLinkResponse,
  PackageResponse,
  ResumeResponse,
  SaveAnswersResponse,
  SubmitResponse,
  TriageResponse,
} from './contract';
import { apiUrl, parseJson, request, type Session } from './api-core';
import { deleteAt, uploadTo, type FileEndpoints, type UploadHandle } from './api-files';

export {
  ApiError,
  INTAKE_API_BASE,
  errorMessage,
  type ApiErrorCode,
  type Session,
} from './api-core';
export type { FileEndpoints, UploadHandle } from './api-files';

export const HEALTH_PATH = '/api/intake/health';
export const LOOKUP_PATH = '/api/intake/lookup';
export const RESUME_PATH = '/api/intake/resume';
export const PING_TIMEOUT_MS = 4000;
export const LOOKUP_TIMEOUT_MS = 4000;

/** True when the API answers `/api/intake/health` within the timeout. */
export async function ping(timeoutMs = PING_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(HEALTH_PATH), {
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

export function deleteFile(session: Session, fileId: string): Promise<void> {
  return deleteAt(`/api/intake/${session.id}/files/${fileId}`, session);
}

/** Pass 1: asks the server to read the story alone (idempotent). `reading` while it runs. */
export function startTriage(session: Session): Promise<TriageResponse> {
  return request<TriageResponse>(
    `/api/intake/${session.id}/triage`,
    { method: 'POST', body: '{}' },
    session,
  );
}

export function getTriage(session: Session): Promise<TriageResponse> {
  return request<TriageResponse>(`/api/intake/${session.id}/triage`, { method: 'GET' }, session);
}

/** Pass 2: starts (or re-requests, idempotently) the evaluation. 202 while it runs. */
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

/**
 * After Send: the person's package (`preparing` while the server builds it).
 * Asked with the session bearer; every `ready` answer carries a NEW one-use
 * link with its own token, good for 15 minutes (`urlExpiresAt`).
 */
export function getPackage(session: Session): Promise<PackageResponse> {
  return request<PackageResponse>(`/api/intake/${session.id}/package`, { method: 'GET' }, session);
}

/**
 * "Send me a new link": the server emails a new link to the request's
 * own address. Throws ApiError with a message safe to show (429 after three in
 * a day).
 */
export function requestPackageLink(session: Session): Promise<PackageLinkResponse> {
  return request<PackageLinkResponse>(
    `/api/intake/${session.id}/package/link`,
    { method: 'POST', body: '{}' },
    session,
  );
}

/** Multipart upload into the consult flow's own request (progress events through XMLHttpRequest). */
export function uploadFile(
  session: Session,
  slot: string,
  file: File,
  onProgress?: (percent: number) => void,
): UploadHandle {
  return uploadTo(`/api/intake/${session.id}/files`, session, slot, file, onProgress);
}

/** The consult flow's file endpoints, the default for `useUploads`. */
export const CONSULT_FILES: FileEndpoints = { upload: uploadFile, remove: deleteFile };
