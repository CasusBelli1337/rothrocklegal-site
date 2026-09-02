'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteFile, errorMessage, uploadFile, type Session, type UploadHandle } from './api';
import type { IntakeFile } from './contract';
import { fileProblem } from './document-slots';

/** A file on its way up, or one that failed. */
export interface PendingUpload {
  localId: string;
  slot: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'error';
  error?: string;
  /** False when the file never left the browser (wrong type, too big): retrying cannot help. */
  retryable: boolean;
}

/** What a drop zone needs; the same binding serves the documents step and follow-up upload modules. */
export interface UploadBinding {
  files: IntakeFile[];
  pending: PendingUpload[];
  add(slot: string, files: Iterable<File>): void;
  retry(localId: string): void;
  cancel(localId: string): void;
  remove(fileId: string): void;
}

interface Source {
  file: File;
  handle?: UploadHandle;
}

const NO_SESSION = 'Your session expired. Go back to the start and try again.';

let counter = 0;
function nextLocalId(): string {
  counter += 1;
  return `up-${Date.now().toString(36)}-${counter}`;
}

export function useUploads(
  session: Session | null,
  files: IntakeFile[],
  onUploaded: (file: IntakeFile) => void,
  onRemoved: (fileId: string) => void,
): UploadBinding {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const sources = useRef(new Map<string, Source>());
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const patch = useCallback((localId: string, change: Partial<PendingUpload>) => {
    if (!alive.current) return;
    setPending((list) => list.map((p) => (p.localId === localId ? { ...p, ...change } : p)));
  }, []);

  const drop = useCallback((localId: string) => {
    sources.current.delete(localId);
    if (alive.current) setPending((list) => list.filter((p) => p.localId !== localId));
  }, []);

  const begin = useCallback(
    (localId: string, slot: string, file: File) => {
      if (!session) {
        patch(localId, { status: 'error', error: NO_SESSION });
        return;
      }
      const handle = uploadFile(session, slot, file, (progress) => patch(localId, { progress }));
      sources.current.set(localId, { file, handle });
      handle.promise
        .then((uploaded) => {
          drop(localId);
          onUploaded(uploaded);
        })
        .catch((caught) => patch(localId, { status: 'error', error: errorMessage(caught) }));
    },
    [session, patch, drop, onUploaded],
  );

  const add = useCallback(
    (slot: string, incoming: Iterable<File>) => {
      let count = files.length + pending.length;
      for (const file of incoming) {
        const localId = nextLocalId();
        const problem = fileProblem(file, count);
        const entry: PendingUpload = {
          localId,
          slot,
          name: file.name,
          size: file.size,
          progress: 0,
          status: problem ? 'error' : 'uploading',
          error: problem ?? undefined,
          retryable: !problem,
        };
        setPending((list) => [...list, entry]);
        if (problem) continue;
        count += 1;
        begin(localId, slot, file);
      }
    },
    [files.length, pending.length, begin],
  );

  const retry = useCallback(
    (localId: string) => {
      const source = sources.current.get(localId);
      const entry = pending.find((p) => p.localId === localId);
      if (!source || !entry) return;
      patch(localId, { status: 'uploading', progress: 0, error: undefined });
      begin(localId, entry.slot, source.file);
    },
    [pending, patch, begin],
  );

  const cancel = useCallback(
    (localId: string) => {
      sources.current.get(localId)?.handle?.abort();
      drop(localId);
    },
    [drop],
  );

  const remove = useCallback(
    (fileId: string) => {
      onRemoved(fileId);
      if (session) deleteFile(session, fileId).catch(() => undefined);
    },
    [session, onRemoved],
  );

  return { files, pending, add, retry, cancel, remove };
}
