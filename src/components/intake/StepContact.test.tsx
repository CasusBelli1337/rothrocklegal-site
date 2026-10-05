// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HeardAbout } from '@/lib/intake/contract';
import { HEARD_ABOUT_COPY, HEARD_ABOUT_LABELS } from '@/lib/intake/copy';
import { emptyState } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { StepContact } from './StepContact';

/** A controller on the contact screen; only what the screen reads is real. */
function controller(heardAbout?: HeardAbout, heardAboutDetail?: string) {
  const state = { ...emptyState(), step: 'contact' as const };
  state.answers = { ...state.answers, heardAbout, heardAboutDetail };
  const patchAnswers = vi.fn();
  const intake = {
    state,
    error: null,
    busy: false,
    saveStatus: 'idle',
    patchAnswers,
    setError: vi.fn(),
    back: vi.fn(),
    startOver: vi.fn(),
    next: vi.fn(),
  } as unknown as IntakeController;
  return { intake, patchAnswers };
}

function renderStep(heardAbout?: HeardAbout, detail?: string) {
  const made = controller(heardAbout, detail);
  render(<StepContact intake={made.intake} uploads={{} as UploadBinding} />);
  return made;
}

afterEach(cleanup);

describe('StepContact: how did you hear about us (2026-10-05)', () => {
  it('offers every channel as a radio under the contact fields', () => {
    renderStep();
    const group = screen.getByRole('group', { name: HEARD_ABOUT_COPY.legend });
    const radios = group.querySelectorAll('input[type=radio]');
    expect([...radios].map((r) => (r as HTMLInputElement).value)).toEqual(
      Object.keys(HEARD_ABOUT_LABELS),
    );
    expect(screen.getByLabelText('Super Lawyers')).toBeTruthy();
    expect(screen.queryByLabelText(/Where\?/)).toBeNull();
  });

  it('writes the choice, and drops a detail typed under a choice that takes none', () => {
    const { patchAnswers } = renderStep('other', 'A podcast');
    fireEvent.click(screen.getByLabelText('Google or another search engine'));
    expect(patchAnswers).toHaveBeenCalledWith({ heardAbout: 'search', heardAboutDetail: undefined });
    fireEvent.click(screen.getByLabelText('A friend, relative, or another lawyer'));
    expect(patchAnswers).toHaveBeenLastCalledWith({
      heardAbout: 'referral',
      heardAboutDetail: 'A podcast',
    });
  });

  it('asks which site, or who, only for the choices that need a word more', () => {
    const { patchAnswers } = renderStep('directory');
    const box = screen.getByLabelText(/Which site\?/);
    fireEvent.change(box, { target: { value: 'Avvo' } });
    expect(patchAnswers).toHaveBeenCalledWith({ heardAboutDetail: 'Avvo' });
    cleanup();
    renderStep('referral');
    expect(screen.getByLabelText(/Who referred you\?/)).toBeTruthy();
    cleanup();
    renderStep('super-lawyers');
    expect(screen.queryByLabelText(/\?\s*\(optional\)/)).toBeNull();
  });
});
