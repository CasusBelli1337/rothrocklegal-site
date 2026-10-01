// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveConsent } from '@/lib/consent/client';
import { submitIntake } from '@/lib/intake/api';
import { emptyState } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { StepReview } from './StepReview';

vi.mock('@/lib/intake/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/intake/api')>()),
  saveFollowUp: vi.fn(() => Promise.resolve()),
  submitIntake: vi.fn(),
}));

const SUBMITTED = { reference: 'RL-2026-000999', status: 'submitted', nextSteps: 'We read it.' } as const;

/** A controller sitting on the review screen with a live session; only what the screen reads is real. */
function controller(): IntakeController {
  const state = { ...emptyState(), step: 'review' as const, session: { id: 's1', token: 't1', status: 'draft', reference: 'RL-1' } };
  return {
    state,
    error: null,
    busy: false,
    saveStatus: 'idle',
    setError: vi.fn(),
    finish: vi.fn(),
    goTo: vi.fn(),
    back: vi.fn(),
    startOver: vi.fn(),
    next: vi.fn(),
  } as unknown as IntakeController;
}

let gtag: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Events count only after a yes to analytics (docs/CONSENT.md).
  saveConsent({ analytics: true, advertising: false });
  gtag = vi.fn();
  (window as Window & { gtag?: unknown }).gtag = gtag;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.mocked(submitIntake).mockReset();
  delete (window as Window & { gtag?: unknown }).gtag;
});

describe('StepReview Send', () => {
  it('counts consult_submitted once the request is sent, with nothing attached', async () => {
    vi.mocked(submitIntake).mockResolvedValue(SUBMITTED);
    const intake = controller();
    render(<StepReview intake={intake} uploads={{} as UploadBinding} />);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(intake.finish).toHaveBeenCalledWith(SUBMITTED));
    expect(gtag.mock.calls).toEqual([['event', 'consult_submitted']]);
  });

  it('counts nothing when the send fails', async () => {
    vi.mocked(submitIntake).mockRejectedValue(new Error('offline'));
    const intake = controller();
    render(<StepReview intake={intake} uploads={{} as UploadBinding} />);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(intake.setError).toHaveBeenCalled());
    expect(gtag).not.toHaveBeenCalled();
  });
});
