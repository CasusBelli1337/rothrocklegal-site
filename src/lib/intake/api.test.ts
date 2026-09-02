import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  createIntake,
  deleteFile,
  errorMessage,
  getEvaluation,
  ping,
  saveAnswers,
  saveFollowUp,
  startEvaluation,
  submitIntake,
  uploadFile,
} from './api';

const session = { id: 'in_1', token: 'secret-token' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  const spy = vi.fn(impl);
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => vi.unstubAllGlobals());

describe('JSON endpoints', () => {
  it('creates an intake with an empty JSON body', async () => {
    const created = { id: 'in_1', token: 't', status: 'draft', reference: 'RL-2026-000001' };
    const spy = mockFetch(async () => json(created, 201));
    await expect(createIntake()).resolves.toEqual(created);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('/api/intake');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{}');
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('sends the bearer token and the answers on PUT', async () => {
    const spy = mockFetch(async () => json({ ok: true, status: 'draft' }));
    await saveAnswers(session, { story: 'hello' });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('/api/intake/in_1/answers');
    expect(init?.method).toBe('PUT');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer secret-token');
    expect(JSON.parse(String(init?.body))).toEqual({ answers: { story: 'hello' } });
  });

  it('covers every other endpoint path and method', async () => {
    const spy = mockFetch(async () =>
      json({ ok: true, status: 'follow-up', reference: 'R', nextSteps: 'n' }),
    );
    await deleteFile(session, 'f9');
    await startEvaluation(session);
    await getEvaluation(session);
    await saveFollowUp(session, { q1: true });
    await submitIntake(session);
    const calls = spy.mock.calls.map(([url, init]) => `${init?.method} ${url}`);
    expect(calls).toEqual([
      'DELETE /api/intake/in_1/files/f9',
      'POST /api/intake/in_1/evaluate',
      'GET /api/intake/in_1/evaluation',
      'PUT /api/intake/in_1/follow-up',
      'POST /api/intake/in_1/submit',
    ]);
  });

  it('maps a JSON error body to an ApiError', async () => {
    mockFetch(async () =>
      json({ error: 'Too many requests. Try again in an hour.', code: 'rate-limited' }, 429),
    );
    const failure = await createIntake().catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiError);
    const apiError = failure as ApiError;
    expect(apiError.code).toBe('rate-limited');
    expect(apiError.status).toBe(429);
    expect(apiError.message).toBe('Too many requests. Try again in an hour.');
  });

  it('falls back to a generic message when the error body is not ours', async () => {
    mockFetch(async () => new Response('<html>502</html>', { status: 502 }));
    const failure = (await submitIntake(session).catch((e: unknown) => e)) as ApiError;
    expect(failure.code).toBe('server-error');
    expect(failure.status).toBe(502);
    expect(errorMessage(failure)).toMatch(/Please try again/);
  });

  it('turns a network failure into a network ApiError', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const failure = (await getEvaluation(session).catch((e: unknown) => e)) as ApiError;
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.code).toBe('network');
    expect(failure.message).toMatch(/could not reach/);
  });
});

describe('ping', () => {
  it('is true only for an ok:true health body', async () => {
    mockFetch(async () => json({ ok: true, version: '1' }));
    await expect(ping()).resolves.toBe(true);
    mockFetch(async () => json({ ok: false }));
    await expect(ping()).resolves.toBe(false);
    mockFetch(async () => new Response('Cannot GET', { status: 404 }));
    await expect(ping()).resolves.toBe(false);
  });

  it('is false when the API does not answer inside the timeout', async () => {
    mockFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    await expect(ping(20)).resolves.toBe(false);
  });

  it('is false when the network fails', async () => {
    mockFetch(async () => {
      throw new TypeError('offline');
    });
    await expect(ping()).resolves.toBe(false);
  });
});

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
