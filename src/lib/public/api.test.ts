import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PUBLIC_API_BASE,
  PublicApiError,
  bookSlot,
  errorMessage,
  fetchEnvelope,
  isNotFound,
  isSlotTaken,
  isWellFormedToken,
  readToken,
  signPdfUrl,
  submitSignature,
} from './api';

const TOKEN = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-AbCdE';
const envelope = {
  documentTitle: 'Engagement Agreement',
  signerName: 'Jane Doe',
  firmName: 'Rothrock Legal',
  status: 'pending',
  pages: 7,
  expiresAt: '2026-09-10T00:00:00.000Z',
};

function respond(status: number, body: unknown) {
  return vi.fn().mockResolvedValue(
    new Response(body === undefined ? '' : JSON.stringify(body), { status }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('token reading', () => {
  it('reads ?t= and ignores blanks', () => {
    expect(readToken(`?t=${TOKEN}`)).toBe(TOKEN);
    expect(readToken('?t=%20')).toBeNull();
    expect(readToken('')).toBeNull();
    expect(readToken('?resume=abc')).toBeNull();
  });

  it('accepts base64url tokens of a sensible length only', () => {
    expect(isWellFormedToken(TOKEN)).toBe(true);
    expect(isWellFormedToken('short')).toBe(false);
    expect(isWellFormedToken(`${TOKEN}/../x`)).toBe(false);
    expect(isWellFormedToken('a'.repeat(129))).toBe(false);
  });
});

describe('public API client', () => {
  it('builds the PDF address under the public prefix', () => {
    expect(PUBLIC_API_BASE.endsWith('/api/intake/public')).toBe(true);
    expect(signPdfUrl('a b')).toBe(`${PUBLIC_API_BASE}/sign/a%20b/pdf`);
  });

  it('returns a guarded envelope', async () => {
    const fetch = respond(200, envelope);
    vi.stubGlobal('fetch', fetch);
    await expect(fetchEnvelope(TOKEN)).resolves.toEqual(envelope);
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${PUBLIC_API_BASE}/sign/${TOKEN}`);
    expect(init.method).toBe('GET');
  });

  it('turns the uniform 404 into not-found whatever the body says', async () => {
    vi.stubGlobal('fetch', respond(404, { error: 'This link is not valid or has expired.', code: 'not-found' }));
    const error = await fetchEnvelope(TOKEN).catch((e: unknown) => e);
    expect(isNotFound(error)).toBe(true);
    expect(errorMessage(error)).toBe('This link is not valid or has expired.');
  });

  it('keeps a validation message, hides a server failure, and flags a lost slot', async () => {
    vi.stubGlobal('fetch', respond(400, { error: 'Type your name to sign.', code: 'bad-request' }));
    const bad = await submitSignature(TOKEN, { consent: true, signatureKind: 'typed', typedName: 'J' }).catch((e: unknown) => e);
    expect(errorMessage(bad)).toBe('Type your name to sign.');

    vi.stubGlobal('fetch', respond(500, { error: 'stack trace', code: 'internal' }));
    const failed = await fetchEnvelope(TOKEN).catch((e: unknown) => e);
    expect(errorMessage(failed)).toBe('Something went wrong on our side. Please try again.');

    vi.stubGlobal('fetch', respond(409, { error: 'That time was just taken.', code: 'slot-taken' }));
    const taken = await bookSlot(TOKEN, { start: 'x', name: 'J', email: 'j@example.com' }).catch((e: unknown) => e);
    expect(isSlotTaken(taken)).toBe(true);
  });

  it('rejects an answer that is not the agreed shape', async () => {
    vi.stubGlobal('fetch', respond(200, { hello: 'world' }));
    const error = await fetchEnvelope(TOKEN).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PublicApiError);
    expect((error as PublicApiError).code).toBe('server-error');
  });

  it('says the server is unreachable when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await fetchEnvelope(TOKEN).catch((e: unknown) => e);
    expect((error as PublicApiError).code).toBe('network');
    expect(errorMessage(error)).toMatch(/could not reach our server/);
  });

  it('sends the booking as JSON to /book', async () => {
    const fetch = respond(200, { booked: true, start: 'a', end: 'b', meetLink: null });
    vi.stubGlobal('fetch', fetch);
    await bookSlot(TOKEN, { start: 'a', name: 'Jane', email: 'jane@example.com', notes: 'hi' });
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${PUBLIC_API_BASE}/schedule/${TOKEN}/book`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ start: 'a', name: 'Jane', email: 'jane@example.com', notes: 'hi' });
  });
});
