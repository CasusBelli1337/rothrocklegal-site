// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicApiError } from '@/lib/public/api';
import type { SignEnvelopePublic } from '@/lib/public/contract';
import { SIGN_COPY } from '@/lib/public/copy';
import { SignPage } from './SignPage';

const api = vi.hoisted(() => ({
  fetchEnvelope: vi.fn(),
  submitSignature: vi.fn(),
}));
vi.mock('@/lib/public/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/public/api')>()),
  fetchEnvelope: api.fetchEnvelope,
  submitSignature: api.submitSignature,
}));
vi.mock('next/font/google', () => ({
  Great_Vibes: () => ({ className: 'font-signature', style: {} }),
}));
// pdf.js needs a real browser; the page only needs to hear how many pages opened.
vi.mock('./PdfDocument', () => ({
  PdfDocument: ({ url, onOpened }: { url: string; onOpened(n: number): void }) => {
    useEffect(() => onOpened(3), [onOpened]);
    return <div data-testid="pdf" data-url={url} />;
  },
}));

const TOKEN = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-AbCdE';
const envelope: SignEnvelopePublic = {
  documentTitle: 'Engagement Agreement',
  signerName: 'Jane Doe',
  firmName: 'Rothrock Legal',
  status: 'pending',
  pages: 3,
  expiresAt: '2026-09-10T00:00:00.000Z',
};

function visit(search: string) {
  window.history.replaceState({}, '', `/sign/${search}`);
  return render(<SignPage />);
}

beforeEach(() => {
  api.fetchEnvelope.mockReset();
  api.submitSignature.mockReset();
});
afterEach(cleanup);

describe('SignPage', () => {
  it('shows the bad-link card without a request when the token is missing', async () => {
    visit('');
    expect(await screen.findByText(SIGN_COPY.invalid.title)).toBeTruthy();
    expect(api.fetchEnvelope).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(SIGN_COPY.title);
  });

  it('shows the bad-link card when the server answers the uniform 404', async () => {
    api.fetchEnvelope.mockRejectedValue(new PublicApiError('This link is not valid or has expired.', 'not-found', 404));
    visit(`?t=${TOKEN}`);
    expect(await screen.findByText(SIGN_COPY.invalid.title)).toBeTruthy();
    expect(screen.getByText(SIGN_COPY.invalid.body)).toBeTruthy();
  });

  it('offers a retry when the server cannot be reached, then loads', async () => {
    api.fetchEnvelope
      .mockRejectedValueOnce(new PublicApiError('We could not reach our server.', 'network'))
      .mockResolvedValueOnce(envelope);
    visit(`?t=${TOKEN}`);
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(api.fetchEnvelope).toHaveBeenCalledTimes(2);
  });

  it('keeps the signature block locked until the person confirms they read it, then signs', async () => {
    api.fetchEnvelope.mockResolvedValue(envelope);
    api.submitSignature.mockResolvedValue({ done: true, signedAt: '2026-09-03T23:12:00.000Z', nextSigner: false });
    visit(`?t=${TOKEN}`);
    const sign = await screen.findByRole('button', { name: SIGN_COPY.signature.button });
    expect((sign as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(SIGN_COPY.read.progress(1, 3))).toBeTruthy();
    expect((screen.getByLabelText(SIGN_COPY.signature.nameLabel) as HTMLInputElement).value).toBe('Jane Doe');

    fireEvent.click(screen.getByRole('button', { name: SIGN_COPY.read.confirm }));
    expect(screen.getByText(SIGN_COPY.read.done)).toBeTruthy();
    expect((sign as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(sign);
    expect(await screen.findByText(SIGN_COPY.problems.consent)).toBeTruthy();
    expect(api.submitSignature).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText(SIGN_COPY.signature.consent));
    await act(async () => {
      fireEvent.click(sign);
    });
    await waitFor(() => expect(screen.getByText(SIGN_COPY.done.title)).toBeTruthy());
    expect(api.submitSignature).toHaveBeenCalledWith(TOKEN, {
      consent: true,
      signatureKind: 'typed',
      signatureText: 'Jane Doe',
      typedName: 'Jane Doe',
    });
    expect(screen.getByText(/We received your signature at/)).toBeTruthy();
    expect(screen.getByText(SIGN_COPY.done.nextFirm)).toBeTruthy();
  });

  it('shows the already-signed card for a signed envelope', async () => {
    api.fetchEnvelope.mockResolvedValue({ ...envelope, status: 'signed' });
    visit(`?t=${TOKEN}`);
    expect(await screen.findByText(SIGN_COPY.alreadySigned.title)).toBeTruthy();
  });

  it('puts a failed signing request back on the form with the message', async () => {
    api.fetchEnvelope.mockResolvedValue(envelope);
    api.submitSignature.mockRejectedValue(new PublicApiError('Type your name to sign.', 'bad-request', 400));
    visit(`?t=${TOKEN}`);
    fireEvent.click(await screen.findByRole('button', { name: SIGN_COPY.read.confirm }));
    fireEvent.click(screen.getByLabelText(SIGN_COPY.signature.consent));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: SIGN_COPY.signature.button }));
    });
    expect(await screen.findByText('Type your name to sign.')).toBeTruthy();
    expect(screen.getByRole('button', { name: SIGN_COPY.signature.button })).toBeTruthy();
  });
});
