// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ACKNOWLEDGMENTS,
  ACKNOWLEDGMENTS_LEGEND,
  HOW_THIS_WORKS,
  START_TILES,
  WHAT_WE_DO,
  WHY_UP_FRONT,
} from '@/lib/intake/copy';
import { emptyState, type StartTile } from '@/lib/intake/state';
import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { StepStart } from './StepStart';

/** A controller sitting on one start tile; only what the tile reads is real. */
function onTile(startTile: StartTile): IntakeController {
  return {
    state: { ...emptyState(), step: 'start' as const, startTile },
    error: null,
    busy: false,
    saveStatus: 'idle',
    update: vi.fn(),
    back: vi.fn(),
    startOver: vi.fn(),
    next: vi.fn(),
  } as unknown as IntakeController;
}

function renderTile(startTile: StartTile) {
  return render(<StepStart intake={onTile(startTile)} uploads={{} as UploadBinding} />);
}

afterEach(cleanup);

describe('StepStart tiles', () => {
  it('tile 1 explains the process in three lines, then why we ask so much', () => {
    renderTile(0);
    expect(screen.getByRole('heading', { name: START_TILES[0].title })).toBeTruthy();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      HOW_THIS_WORKS.map((line, i) => `${i + 1}${line}`),
    );
    expect(screen.getByText(WHY_UP_FRONT)).toBeTruthy();
    expect(screen.getByRole('button', { name: START_TILES[0].button })).toBeTruthy();
  });

  it('tile 2 links the deadline tool in the same tab', () => {
    renderTile(1);
    const link = screen.getByRole('link', { name: 'our deadline tool' });
    // next/link drops the trailing slash outside the real config (trailingSlash: true in the build).
    expect(link.getAttribute('href')).toMatch(/^\/how-long-do-i-have\/?$/);
    expect(link.getAttribute('target')).toBeNull();
    expect(link.closest('p')?.textContent).toMatch(
      /talk to a lawyer now\. You can also check a date with our deadline tool\.$/,
    );
  });

  it('tile 3 says what we do with it, then the three statements to read', () => {
    const { container } = renderTile(2);
    const text = container.textContent ?? '';
    const order = [...WHAT_WE_DO, ACKNOWLEDGMENTS_LEGEND, ...ACKNOWLEDGMENTS].map((line) =>
      text.indexOf(line),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getByRole('button', { name: START_TILES[2].button })).toBeTruthy();
  });
});
