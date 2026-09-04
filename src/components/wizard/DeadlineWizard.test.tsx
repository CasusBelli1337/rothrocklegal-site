// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeadlineWizard, wizardHeadingId } from './DeadlineWizard';
import { WIZARD_STORAGE_KEY, type WizardState } from './storage';

const HEADER_HEIGHT = 72;
const PANEL_TOP = 300;
/** What revealPanel should aim for: the panel's top, less the header, less 16px of air. */
const PANEL_UNDER_HEADER = PANEL_TOP - HEADER_HEIGHT - 16;

/** A saved run that is sitting on the results, four steps long: death, instrument, notice, concerns. */
const FINISHED: WizardState = {
  version: 1,
  answers: { deathDate: '2026-03-02', instrument: 'trust', noticeServed: 'no', concerns: [] },
  stepIndex: 3,
  showResults: true,
};

let scrollTo: ReturnType<typeof vi.fn>;

/** Renders the wizard under a 72px sticky header with the panel 300px down the viewport. */
function mount(saved?: WizardState) {
  if (saved) window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(saved));
  const header = document.createElement('header');
  header.getBoundingClientRect = () => ({ height: HEADER_HEIGHT, top: 0 }) as DOMRect;
  document.body.append(header);
  const { container } = render(<DeadlineWizard />);
  const panel = container.querySelector('.wizard') as HTMLElement;
  panel.getBoundingClientRect = () => ({ top: PANEL_TOP, height: 900 }) as DOMRect;
}

function press(label: string) {
  fireEvent.click(screen.getByRole('button', { name: label }));
}

function answerDateOfDeath() {
  fireEvent.change(screen.getByLabelText('Date of death'), { target: { value: '2026-03-02' } });
}

beforeEach(() => {
  window.localStorage.clear();
  scrollTo = vi.fn();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('wizardHeadingId', () => {
  it('names the results heading or the question on screen', () => {
    expect(wizardHeadingId(true, 'death')).toBe('wizard-results-heading');
    expect(wizardHeadingId(false, 'instrument')).toBe('wizard-q-instrument');
  });
});

describe('DeadlineWizard', () => {
  it('sits still on the first paint', () => {
    mount(FINISHED);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('brings the next question under the header and focuses it', () => {
    mount();
    answerDateOfDeath();
    press('Continue');
    expect(scrollTo).toHaveBeenCalledWith({ top: PANEL_UNDER_HEADER, behavior: 'smooth' });
    expect(document.activeElement?.id).toBe('wizard-q-instrument');
  });

  it('does the same on Back', () => {
    mount();
    answerDateOfDeath();
    press('Continue');
    scrollTo.mockClear();
    press('Back');
    expect(scrollTo).toHaveBeenCalledWith({ top: PANEL_UNDER_HEADER, behavior: 'smooth' });
    expect(document.activeElement?.id).toBe('wizard-q-death');
  });

  it('treats Start over as a move', () => {
    mount();
    answerDateOfDeath();
    press('Continue');
    scrollTo.mockClear();
    press('Start over');
    expect(scrollTo).toHaveBeenCalledWith({ top: PANEL_UNDER_HEADER, behavior: 'smooth' });
    expect(document.activeElement?.id).toBe('wizard-q-death');
  });

  it('leaves the page alone when the answer is missing', () => {
    mount();
    press('Continue');
    expect(screen.getByRole('alert').textContent).toContain('date of death');
    expect(scrollTo).not.toHaveBeenCalled();
    expect(document.activeElement?.id).not.toBe('wizard-q-instrument');
  });

  it('reveals the results and the question the visitor comes back to', () => {
    mount(FINISHED);
    press('Change my answers');
    expect(scrollTo).toHaveBeenCalledWith({ top: PANEL_UNDER_HEADER, behavior: 'smooth' });
    expect(document.activeElement?.id).toBe('wizard-q-concerns');
    scrollTo.mockClear();
    press('Show my deadlines');
    expect(scrollTo).toHaveBeenCalledWith({ top: PANEL_UNDER_HEADER, behavior: 'smooth' });
    expect(document.activeElement?.id).toBe('wizard-results-heading');
  });
});
