import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  createIntake,
  deleteFile,
  errorMessage,
  getEvaluation,
  getTriage,
  lookupEmail,
  ping,
  resumeIntake,
  saveAnswers,
  saveFollowUp,
  startEvaluation,
  startTriage,
  submitIntake,
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
    await startTriage(session);
    await getTriage(session);
    await startEvaluation(session);
    await getEvaluation(session);
    await saveFollowUp(session, { q1: true });
    await submitIntake(session);
    const calls = spy.mock.calls.map(([url, init]) => `${init?.method} ${url}`);
    expect(calls).toEqual([
      'DELETE /api/intake/in_1/files/f9',
      'POST /api/intake/in_1/triage',
      'GET /api/intake/in_1/triage',
      'POST /api/intake/in_1/evaluate',
      'GET /api/intake/in_1/evaluation',
      'PUT /api/intake/in_1/follow-up',
      'POST /api/intake/in_1/submit',
    ]);
    // Each POST that starts a pass sends an empty JSON body and the bearer token.
    const triage = spy.mock.calls[1][1];
    expect(triage?.body).toBe('{}');
    expect((triage?.headers as Record<string, string>).Authorization).toBe('Bearer secret-token');
  });

  it('passes the triage answer through as the server sent it', async () => {
    const storyRead = {
      situations: ['trust-contests'],
      whatWeUnderstood: 'w',
      parties: [],
      documents: [],
    };
    mockFetch(async () => json({ status: 'ready', storyRead }));
    await expect(getTriage(session)).resolves.toEqual({ status: 'ready', storyRead });
    mockFetch(async () => json({ status: 'unavailable' }));
    await expect(startTriage(session)).resolves.toEqual({ status: 'unavailable' });
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

describe('lookupEmail', () => {
  it('is true only for a found:true body and sends the current session token', async () => {
    const spy = mockFetch(async () => json({ found: true }));
    await expect(lookupEmail('jane@example.com', session)).resolves.toBe(true);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('/api/intake/lookup');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'jane@example.com' });
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer secret-token');
  });

  it('works without a session and is false for found:false', async () => {
    const spy = mockFetch(async () => json({ found: false }));
    await expect(lookupEmail('jane@example.com')).resolves.toBe(false);
    expect((spy.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('never blocks the flow: 404, garbage, network failure and timeout are all false', async () => {
    mockFetch(async () => json({ error: 'Not found', code: 'not-found' }, 404));
    await expect(lookupEmail('jane@example.com')).resolves.toBe(false);
    mockFetch(async () => new Response('<html>edge</html>', { status: 200 }));
    await expect(lookupEmail('jane@example.com')).resolves.toBe(false);
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(lookupEmail('jane@example.com')).resolves.toBe(false);
    mockFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('x', 'AbortError')),
          );
        }),
    );
    await expect(lookupEmail('jane@example.com', null, 10)).resolves.toBe(false);
  });
});

describe('resumeIntake', () => {
  it('posts the token and returns the earlier request', async () => {
    const body = {
      session: { ...session, status: 'draft', reference: 'RL-1' },
      answers: {},
      files: [],
    };
    const spy = mockFetch(async () => json(body));
    await expect(resumeIntake('tok')).resolves.toEqual(body);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('/api/intake/resume');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'tok' });
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('rejects with the server message when the link is spent', async () => {
    mockFetch(async () => json({ error: 'That link has expired.', code: 'not-found' }, 404));
    await expect(resumeIntake('old')).rejects.toMatchObject({ code: 'not-found', status: 404 });
  });
});

