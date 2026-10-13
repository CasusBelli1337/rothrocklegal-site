import type {
  AdditionLookupResponse,
  AdditionOpenResponse,
  AdditionSendRequest,
  AdditionSendResponse,
  AdditionState,
} from './contract';
import { request, type Session } from './api-core';
import { deleteAt, uploadTo, type FileEndpoints, type UploadHandle } from './api-files';

/**
 * "Add to your request" (contract section of the same name): the emailed link
 * opens an addition with its own bearer; every later call speaks for that
 * addition only, never for the request's own session.
 */
export const ADD_LOOKUP_PATH = '/api/intake/add/lookup';
export const ADD_OPEN_PATH = '/api/intake/add/open';

const additionPath = (id: string): string => `/api/intake/add/${encodeURIComponent(id)}`;

/** Asks the server to email a link for the address. The answer is the same whether or not a request exists. */
export async function lookupAddition(email: string): Promise<void> {
  await request<AdditionLookupResponse>(ADD_LOOKUP_PATH, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Spends the emailed token for a new addition. Throws ApiError: 401 spent or expired, 400 closed, 429 limit. */
export function openAddition(token: string): Promise<AdditionOpenResponse> {
  return request<AdditionOpenResponse>(ADD_OPEN_PATH, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/** What a refreshed page needs: the note so far and the files already uploaded. */
export function getAddition(addition: Session): Promise<AdditionState> {
  return request<AdditionState>(additionPath(addition.id), { method: 'GET' }, addition);
}

export async function saveAdditionNote(addition: Session, note: string): Promise<void> {
  await request<{ ok: true }>(
    `${additionPath(addition.id)}/note`,
    { method: 'PUT', body: JSON.stringify({ note }) },
    addition,
  );
}

/**
 * Sends the addition with the ids of every file the page lists as uploaded;
 * the server sends only when they match what it holds (400 otherwise, and the
 * page reloads the list so the person can check it).
 */
export function sendAddition(
  addition: Session,
  fileIds: readonly string[],
): Promise<AdditionSendResponse> {
  const body: AdditionSendRequest = { fileIds: [...fileIds] };
  return request<AdditionSendResponse>(
    `${additionPath(addition.id)}/send`,
    { method: 'POST', body: JSON.stringify(body) },
    addition,
  );
}

export function uploadAdditionFile(
  addition: Session,
  slot: string,
  file: File,
  onProgress?: (percent: number) => void,
): UploadHandle {
  return uploadTo(`${additionPath(addition.id)}/files`, addition, slot, file, onProgress);
}

export function deleteAdditionFile(addition: Session, fileId: string): Promise<void> {
  return deleteAt(`${additionPath(addition.id)}/files/${encodeURIComponent(fileId)}`, addition);
}

/** The addition's file endpoints, handed to `useUploads`. */
export const ADDITION_FILES: FileEndpoints = {
  upload: uploadAdditionFile,
  remove: deleteAdditionFile,
};
