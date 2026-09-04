'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteFile, errorMessage, uploadFile, type Session, type UploadHandle } from './api';
import type { IntakeFile } from './contract';
import { fileProblem } from './document-slots';

/** Uploads in flight at once; the rest wait in order (a whole case file arrives as hundreds). */
export const MAX_CONCURRENT_UPLOADS = 3;
/** A failed upload is tried again once on its own before it is listed as not sent. */
export const AUTO_RETRIES = 1;

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
  /** Tries so far (0 while still queued for the first). */
  attempts: number;
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
  slot: string;
  handle?: UploadHandle;
  attempts: number;
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
  const queue = useRef<string[]>([]);
  const active = useRef(0);
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
    queue.current = queue.current.filter((id) => id !== localId);
    if (alive.current) setPending((list) => list.filter((p) => p.localId !== localId));
  }, []);

  /** Starts queued uploads while fewer than MAX_CONCURRENT_UPLOADS are in flight. */
  const startRef = useRef<(localId: string) => void>(() => undefined);
  const pump = useCallback(() => {
    while (active.current < MAX_CONCURRENT_UPLOADS && queue.current.length > 0) {
      const next = queue.current.shift();
      if (next) startRef.current(next);
    }
  }, []);

  /** Starts one upload now; on failure it is tried once more on its own, then left as not sent. */
  const start = useCallback(
    (localId: string) => {
      const source = sources.current.get(localId);
      if (!source) return;
      if (!session) {
        patch(localId, { status: 'error', error: NO_SESSION });
        return;
      }
      active.current += 1;
      source.attempts += 1;
      patch(localId, { status: 'uploading', progress: 0, error: undefined, attempts: source.attempts });
      const handle = uploadFile(session, source.slot, source.file, (progress) =>
        patch(localId, { progress }),
      );
      source.handle = handle;
      handle.promise
        .then((uploaded) => {
          active.current -= 1;
          drop(localId);
          onUploaded(uploaded);
        })
        .catch((caught: unknown) => {
          active.current -= 1;
          if (!sources.current.has(localId)) return;
          if (source.attempts <= AUTO_RETRIES && alive.current) {
            patch(localId, { progress: 0, error: undefined });
            queue.current.unshift(localId);
            return;
          }
          patch(localId, { status: 'error', error: errorMessage(caught) });
        })
        .finally(pump);
    },
    [session, patch, drop, onUploaded, pump],
  );
  startRef.current = start;

  const enqueue = useCallback(
    (localId: string) => {
      queue.current.push(localId);
      pump();
    },
    [pump],
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
          attempts: 0,
        };
        setPending((list) => [...list, entry]);
        if (problem) continue;
        count += 1;
        sources.current.set(localId, { file, slot, attempts: 0 });
        enqueue(localId);
      }
    },
    [files.length, pending.length, enqueue],
  );

  const retry = useCallback(
    (localId: string) => {
      const source = sources.current.get(localId);
      if (!source) return;
      source.attempts = 0;
      enqueue(localId);
    },
    [enqueue],
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
