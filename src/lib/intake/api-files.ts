import type { IntakeFile, UploadFileResponse } from './contract';
import {
  ApiError,
  NETWORK_MESSAGE,
  apiUrl,
  parseJson,
  request,
  toApiError,
  type Session,
} from './api-core';

export interface UploadHandle {
  promise: Promise<IntakeFile>;
  abort(): void;
}

/**
 * Where a drop zone sends its files and removes them again: the consult flow's
 * `/api/intake/:id/files` (api.ts) or an addition's `/api/intake/add/:id/files`
 * (api-add.ts). `useUploads` takes one of these.
 */
export interface FileEndpoints {
  upload(
    session: Session,
    slot: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): UploadHandle;
  remove(session: Session, fileId: string): Promise<void>;
}

function isUploadResponse(value: unknown): value is UploadFileResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as UploadFileResponse).file === 'object'
  );
}

/** Multipart upload to `path` over XMLHttpRequest so the browser reports progress events. */
export function uploadTo(
  path: string,
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
    xhr.open('POST', apiUrl(path));
    xhr.setRequestHeader('Authorization', `Bearer ${session.token}`);
    xhr.setRequestHeader('Accept', 'application/json');
    const form = new FormData();
    form.append('slot', slot);
    form.append('file', file, file.name);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}

/** DELETE one uploaded file at `path`. */
export async function deleteAt(path: string, session: Session): Promise<void> {
  await request<{ ok: true }>(path, { method: 'DELETE' }, session);
}
