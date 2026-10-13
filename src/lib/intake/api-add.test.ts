import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ADDITION_FILES,
  getAddition,
  lookupAddition,
  openAddition,
  saveAdditionNote,
  sendAddition,
} from './api-add';
import { ApiError } from './api-core';

const addition = { id: 'add_1', token: 'addition-bearer' };

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

const headersOf = (init?: RequestInit) => init?.headers as Record<string, string>;

afterEach(() => vi.unstubAllGlobals());

describe('the email and the emailed link', () => {
  it('asks for a link with the address only, and never sends a bearer', async () => {
    const spy = mockFetch(async () => json({ ok: true }));
    await lookupAddition('maria@example.test');
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('/api/intake/add/lookup');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'maria@example.test' });
    expect(headersOf(init).Authorization).toBeUndefined();
  });

  it('spends the token for an addition, and throws the server status on a spent link', async () => {
    const opened = { addition: { ...addition, reference: 'RL-1', sentAt: 's', expiresAt: 'e' } };
    const spy = mockFetch(async () => json(opened));
    await expect(openAddition('tok')).resolves.toEqual(opened);
    expect(spy.mock.calls[0][0]).toBe('/api/intake/add/open');
    expect(JSON.parse(String(spy.mock.calls[0][1]?.body))).toEqual({ token: 'tok' });

    mockFetch(async () => json({ error: 'That link has expired.', code: 'unauthorized' }, 401));
    const failure = (await openAddition('tok').catch((e: unknown) => e)) as ApiError;
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(401);
    expect(failure.message).toBe('That link has expired.');
  });
});

describe('the addition, with its own bearer', () => {
  it('reads the state, saves the note, and sends the file ids it lists', async () => {
    const spy = mockFetch(async () => json({ ok: true }));
    await getAddition(addition);
    await saveAdditionNote(addition, 'the deed is from 2021');
    await sendAddition(addition, ['f1', 'f2']);
    const calls = spy.mock.calls.map(([url, init]) => [url, init?.method]);
    expect(calls).toEqual([
      ['/api/intake/add/add_1', 'GET'],
      ['/api/intake/add/add_1/note', 'PUT'],
      ['/api/intake/add/add_1/send', 'POST'],
    ]);
    for (const [, init] of spy.mock.calls)
      expect(headersOf(init).Authorization).toBe('Bearer addition-bearer');
    expect(JSON.parse(String(spy.mock.calls[1][1]?.body))).toEqual({
      note: 'the deed is from 2021',
    });
    expect(JSON.parse(String(spy.mock.calls[2][1]?.body))).toEqual({ fileIds: ['f1', 'f2'] });
  });

  it('sends an empty list for a note alone, and passes a list mismatch back as a 400', async () => {
    const spy = mockFetch(async () =>
      json(
        {
          error: 'The files you see differ from ours. Check the list and send again.',
          code: 'bad-request',
        },
        400,
      ),
    );
    const failure = (await sendAddition(addition, []).catch((e: unknown) => e)) as ApiError;
    expect(JSON.parse(String(spy.mock.calls[0][1]?.body))).toEqual({ fileIds: [] });
    expect(failure.status).toBe(400);
    expect(failure.code).toBe('bad-request');
  });

  it('removes a file at the addition path', async () => {
    const spy = mockFetch(async () => json({ ok: true }));
    await ADDITION_FILES.remove(addition, 'f9');
    expect(spy.mock.calls[0][0]).toBe('/api/intake/add/add_1/files/f9');
    expect(spy.mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('uploads into the addition with its bearer', () => {
    const opened: { method?: string; url?: string; headers: Record<string, string> } = {
      headers: {},
    };
    class FakeXhr {
      upload = { addEventListener: () => undefined };
      addEventListener() {}
      open(method: string, url: string) {
        opened.method = method;
        opened.url = url;
      }
      setRequestHeader(key: string, value: string) {
        opened.headers[key] = value;
      }
      send() {}
      abort() {}
    }
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    ADDITION_FILES.upload(addition, 'documents', new File(['x'], 'deed.pdf'));
    expect(opened).toEqual({
      method: 'POST',
      url: '/api/intake/add/add_1/files',
      headers: { Authorization: 'Bearer addition-bearer', Accept: 'application/json' },
    });
  });
});
