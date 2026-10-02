// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/intake/api';
import { PACKAGE_COPY } from '@/lib/intake/copy';
import { PACKAGE_REFRESH_AFTER_DOWNLOAD_MS } from '@/lib/intake/use-package';
import { PackageCard } from './PackageCard';

vi.mock('@/lib/intake/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/intake/api')>()),
  getPackage: vi.fn(),
  requestPackageLink: vi.fn(),
}));

const getPackage = vi.mocked(api.getPackage);
const requestPackageLink = vi.mocked(api.requestPackageLink);
const session = { id: 'in_1', token: 'secret-token' };
// Midday UTC is October 15 on every clock from UTC-11 to UTC+11, so the test reads the same anywhere.
const READY = {
  status: 'ready' as const,
  url: 'https://intake.example/api/intake/package/first-token',
  urlExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  expiresAt: '2026-10-15T12:00:00.000Z',
  sizeBytes: 13_002_342,
  fileCount: 9,
};
const NEXT = { ...READY, url: 'https://intake.example/api/intake/package/second-token' };

const flush = () => act(() => vi.advanceTimersByTimeAsync(0));
const card = () => screen.getByRole('region', { name: PACKAGE_COPY.title });
const downloadButton = () =>
  screen.getByRole('button', { name: PACKAGE_COPY.download }) as HTMLButtonElement;
/** Every form the card submits (jsdom does not navigate): method and action. */
let submitted: { method: string; action: string }[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  getPackage.mockReset();
  requestPackageLink.mockReset();
  submitted = [];
  // A hidden form from an earlier test whose timer never ran.
  document.body.querySelectorAll('form').forEach((f) => f.remove());
  vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (this: HTMLFormElement) {
    submitted.push({ method: this.method, action: this.action });
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PackageCard', () => {
  it('renders nothing at all when the server has no package', async () => {
    getPackage.mockResolvedValue({ status: 'unavailable' });
    const { container } = render(<PackageCard session={session} />);
    await flush();
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing before the first answer', () => {
    getPackage.mockReturnValue(new Promise(() => {}));
    const { container } = render(<PackageCard session={session} />);
    expect(container.innerHTML).toBe('');
  });

  it('says the package is on its way while the server builds it', async () => {
    getPackage.mockResolvedValue({ status: 'preparing' });
    render(<PackageCard session={session} />);
    await flush();
    expect(screen.getByRole('heading', { name: PACKAGE_COPY.title })).toBeTruthy();
    expect(within(card()).getAllByRole('status')[0]?.textContent).toBe(PACKAGE_COPY.preparing);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('downloads with a form POST to the one-use link from a form of its own, and says the emailed link works once', async () => {
    getPackage.mockResolvedValue(READY);
    render(
      <form data-testid="step">
        <PackageCard session={session} email="qa@example.test" />
      </form>,
    );
    await flush();
    // Never a form inside the step's form (forms cannot nest), and never a GET link.
    expect(card().querySelector('form')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(downloadButton().type).toBe('button');
    expect(downloadButton().className).toMatch(/bg-maroon-900/);
    expect(card().textContent).toContain(
      'One zip file, 12.4 MB, with the 9 documents you uploaded. You can download it until October 15, 2026. The link in your email works once, so download your package and keep your own copy. Your package is confidential and may be privileged.',
    );
    fireEvent.click(downloadButton());
    expect(submitted).toEqual([{ method: 'post', action: READY.url }]);
  });

  it('holds the button after a press and swaps in a fresh link, so a second press never reuses one', async () => {
    getPackage.mockResolvedValueOnce(READY).mockResolvedValueOnce(NEXT);
    render(<PackageCard session={session} />);
    await flush();
    fireEvent.click(downloadButton());
    await flush();
    expect(downloadButton().disabled).toBe(true);
    expect(getPackage).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(PACKAGE_REFRESH_AFTER_DOWNLOAD_MS));
    expect(getPackage).toHaveBeenCalledTimes(2);
    expect(downloadButton().disabled).toBe(false);
    fireEvent.click(downloadButton());
    expect(submitted.map((f) => f.action)).toEqual([READY.url, NEXT.url]);
    expect(document.querySelectorAll('form')).toHaveLength(1);
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(document.querySelectorAll('form')).toHaveLength(0);
  });

  it('"Send me a new link" asks the server and says where the link went', async () => {
    getPackage.mockResolvedValue(READY);
    requestPackageLink.mockResolvedValue({ sent: true });
    render(<PackageCard session={session} email="qa@example.test" />);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: PACKAGE_COPY.newLink }));
    expect(screen.getByRole('button', { name: PACKAGE_COPY.newLinkSending })).toBeTruthy();
    await flush();
    expect(requestPackageLink).toHaveBeenCalledWith(session);
    expect(card().textContent).toContain('A new link is on its way to qa@example.test.');
  });

  it('"Send me a new link" shows the server\'s words when it says no', async () => {
    getPackage.mockResolvedValue(READY);
    const message = 'You have asked for a new link three times today. Please try again tomorrow.';
    requestPackageLink.mockRejectedValue(new api.ApiError(message, 'rate-limited', 429));
    render(<PackageCard session={session} email="qa@example.test" />);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: PACKAGE_COPY.newLink }));
    await flush();
    expect(card().textContent).toContain(message);
    expect(card().textContent).not.toContain('on its way');
  });

  it('says the link will come by email when the wait runs past the cap', async () => {
    getPackage.mockResolvedValue({ status: 'preparing' });
    render(<PackageCard session={session} />);
    await act(() => vi.advanceTimersByTimeAsync(15 * 60_000));
    expect(within(card()).getAllByRole('status')[0]?.textContent).toBe(PACKAGE_COPY.slow);
    expect(screen.queryByRole('button', { name: PACKAGE_COPY.newLink })).toBeNull();
  });
});
