// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { LENSES, type Lens } from './types';
import { slotShows, syncLensSlots } from './slots';

afterEach(() => {
  document.body.innerHTML = '';
});

/** One slot as the static export renders it: neutral shared with beneficiary, trustee hidden. */
function mountSlot(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML =
    '<span data-slot="t" data-for="neutral beneficiary">same</span>' +
    '<span data-slot="t" data-for="trustee" hidden="">other</span>';
  document.body.append(root);
  return root;
}

function visible(root: ParentNode): string[] {
  return [...root.querySelectorAll<HTMLElement>('[data-for]')]
    .filter((el) => !el.hidden)
    .map((el) => el.textContent ?? '');
}

describe('slotShows', () => {
  it('matches whole lens names in data-for', () => {
    expect(slotShows('neutral beneficiary', 'neutral')).toBe(true);
    expect(slotShows('neutral beneficiary', 'beneficiary')).toBe(true);
    expect(slotShows('neutral beneficiary', 'trustee')).toBe(false);
    expect(slotShows('', 'neutral')).toBe(false);
  });
});

describe('syncLensSlots', () => {
  it('shows exactly one framing per slot under every lens', () => {
    const root = mountSlot();
    const expected: Record<Lens, string> = {
      neutral: 'same',
      beneficiary: 'same',
      trustee: 'other',
    };
    for (const lens of LENSES) {
      syncLensSlots(root, lens);
      expect(visible(root), lens).toEqual([expected[lens]]);
    }
  });

  it('puts the static state back under neutral (the preview Reset)', () => {
    const root = mountSlot();
    const before = root.innerHTML;
    syncLensSlots(root, 'trustee');
    syncLensSlots(root, 'neutral');
    expect(root.innerHTML).toBe(before);
  });
});
