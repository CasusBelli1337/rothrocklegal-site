// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { START_OVER_CONFIRM } from '@/lib/intake/copy';
import { emptyState } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { StepDone } from './StepDone';

/** The done screen with no session, so the package card stays out of it. */
function done(): IntakeController {
  return {
    state: {
      ...emptyState(),
      step: 'done' as const,
      result: { reference: 'RL-2026-000999', status: 'submitted', nextSteps: 'x' },
    },
    error: null,
    busy: false,
    saveStatus: 'idle',
    startOver: vi.fn(),
  } as unknown as IntakeController;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('StepDone "add to your request" line', () => {
  it('points at the add page in the same tab', () => {
    render(<StepDone intake={done()} uploads={{} as UploadBinding} />);
    const link = screen.getByRole('link', { name: 'rothrocklegal.com/request-a-consult/add/' });
    // next/link drops the trailing slash outside the build (the export keeps trailingSlash: true).
    expect(link.getAttribute('href')).toMatch(/^\/request-a-consult\/add\/?$/);
    expect(link.getAttribute('target')).toBeNull();
    expect(
      screen.getByText(/If you think of something later, you can add to your request at/),
    ).toBeTruthy();
  });
});

describe('StepDone "Start a new request"', () => {
  it('asks first, and keeps the screen when the answer is no', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const intake = done();
    render(<StepDone intake={intake} uploads={{} as UploadBinding} />);
    expect(screen.getByText('RL-2026-000999')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Start a new request' }));
    expect(confirm).toHaveBeenCalledWith(START_OVER_CONFIRM);
    expect(intake.startOver).not.toHaveBeenCalled();
  });

  it('clears the flow once the person says yes', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const intake = done();
    render(<StepDone intake={intake} uploads={{} as UploadBinding} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start a new request' }));
    expect(intake.startOver).toHaveBeenCalledOnce();
  });
});
