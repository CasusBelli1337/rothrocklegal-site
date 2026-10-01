// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/intake/api';
import { PACKAGE_COPY } from '@/lib/intake/copy';
import { PackageCard } from './PackageCard';

vi.mock('@/lib/intake/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/intake/api')>()),
  getPackage: vi.fn(),
}));

const getPackage = vi.mocked(api.getPackage);
const session = { id: 'in_1', token: 'secret-token' };
// Midday UTC is October 15 on every clock from UTC-11 to UTC+11, so the test reads the same anywhere.
const READY = {
  status: 'ready' as const,
  url: 'https://intake.example/package/abc.zip?t=download-token',
  expiresAt: '2026-10-15T12:00:00.000Z',
  sizeBytes: 13_002_342,
  fileCount: 9,
};

const flush = () => act(() => vi.advanceTimersByTimeAsync(0));

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  getPackage.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
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
    expect(screen.getByRole('status').textContent).toBe(PACKAGE_COPY.preparing);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('offers the download in the same tab with its size, documents, and expiry', async () => {
    getPackage.mockResolvedValue(READY);
    render(<PackageCard session={session} />);
    await flush();
    const link = screen.getByRole('link', { name: PACKAGE_COPY.download });
    expect(link.getAttribute('href')).toBe(READY.url);
    expect(link.hasAttribute('download')).toBe(true);
    expect(link.getAttribute('target')).toBeNull();
    expect(link.className).toMatch(/bg-maroon-900/);
    expect(screen.getByRole('status').textContent).toContain(
      'One zip file, 12.4 MB, with the 9 documents you uploaded. The link works until October 15, 2026. We also email you this link.',
    );
  });

  it('says the link will come by email when the wait runs past the cap', async () => {
    getPackage.mockResolvedValue({ status: 'preparing' });
    render(<PackageCard session={session} />);
    await act(() => vi.advanceTimersByTimeAsync(15 * 60_000));
    expect(screen.getByRole('status').textContent).toBe(PACKAGE_COPY.slow);
  });
});
