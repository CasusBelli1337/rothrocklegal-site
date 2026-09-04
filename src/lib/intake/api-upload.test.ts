import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, uploadFile } from './api';

const session = { id: 'in_1', token: 'secret-token' };

afterEach(() => vi.unstubAllGlobals());

type Listener = (event?: unknown) => void;

/** Enough of XMLHttpRequest to drive uploadFile. */
class FakeXhr {
  static last: FakeXhr;
  upload = {
    listeners: {} as Record<string, Listener>,
    addEventListener(type: string, fn: Listener) {
      this.listeners[type] = fn;
    },
  };
  listeners: Record<string, Listener> = {};
  headers: Record<string, string> = {};
  method = '';
  url = '';
  body: FormData | null = null;
  status = 0;
  responseText = '';
  constructor() {
    FakeXhr.last = this;
  }
  addEventListener(type: string, fn: Listener) {
    this.listeners[type] = fn;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }
  send(body: FormData) {
    this.body = body;
  }
  abort() {
    this.listeners.abort?.();
  }
  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(body);
    this.listeners.load?.();
  }
  progress(loaded: number, total: number) {
    this.upload.listeners.progress?.({ lengthComputable: true, loaded, total });
  }
}

describe('uploadFile', () => {
  const file = new File(['hello'], 'trust.pdf', { type: 'application/pdf' });

  it('posts multipart with the slot, reports progress, and resolves the file', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const progress = vi.fn();
    const handle = uploadFile(session, 'trust', file, progress);
    const xhr = FakeXhr.last;
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('/api/intake/in_1/files');
    expect(xhr.headers.Authorization).toBe('Bearer secret-token');
    expect(xhr.body?.get('slot')).toBe('trust');
    expect((xhr.body?.get('file') as File).name).toBe('trust.pdf');
    xhr.progress(50, 100);
    expect(progress).toHaveBeenCalledWith(50);
    const uploaded = {
      id: 'f1',
      slot: 'trust',
      name: 'trust.pdf',
      size: 5,
      mimeType: 'application/pdf',
      uploadedAt: 'now',
    };
    xhr.respond(201, { file: uploaded });
    await expect(handle.promise).resolves.toEqual(uploaded);
  });

  it("rejects with the server's ApiError", async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const handle = uploadFile(session, 'trust', file);
    FakeXhr.last.respond(413, { error: 'That file is too big.', code: 'too-large' });
    const failure = (await handle.promise.catch((e: unknown) => e)) as ApiError;
    expect(failure.code).toBe('too-large');
    expect(failure.message).toBe('That file is too big.');
  });

  it('rejects when aborted', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const handle = uploadFile(session, 'trust', file);
    handle.abort();
    await expect(handle.promise).rejects.toBeInstanceOf(ApiError);
  });
});
