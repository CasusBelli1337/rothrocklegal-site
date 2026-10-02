// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { lensConfig } from '@/config/lens';
import { a11yBootScript } from '@/lib/a11y/boot';
import { lensBootScript } from './boot';
import { syncLensSlots } from './slots';
import { emptyLensState, resolveLens } from './store';
import { LENSES } from './types';

/** The slot markup the static export ships: neutral visible, the other framings hidden. */
const SLOTS =
  '<span data-slot="a" data-for="neutral beneficiary">a-nb</span>' +
  '<span data-slot="a" data-for="trustee" hidden="">a-t</span>' +
  '<div data-slot="b" data-for="neutral">b-n</div>' +
  '<div data-slot="b" data-for="trustee" hidden="">b-t</div>' +
  '<div data-slot="b" data-for="beneficiary" hidden="">b-b</div>';

/** Runs the inline script against the real jsdom document and a fake localStorage. */
function boot(stored: string | null, getItemThrows = false): void {
  const localStorage = {
    getItem: () => {
      if (getItemThrows) throw new Error('blocked');
      return stored;
    },
  };
  new Function('localStorage', lensBootScript())(localStorage);
}

/** What the parser does after the head script: adds the body content. */
async function parseBody(): Promise<string[]> {
  document.body.innerHTML = SLOTS;
  await Promise.resolve(); // MutationObserver callbacks are microtasks
  return visibleText();
}

function visibleText(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-for]')]
    .filter((el) => !el.hidden)
    .map((el) => el.textContent ?? '');
}

/** Every observer a boot run installs, so each test starts with none still listening. */
const observers: MutationObserver[] = [];
const NativeObserver = globalThis.MutationObserver;
beforeAll(() => {
  globalThis.MutationObserver = class extends NativeObserver {
    constructor(callback: MutationCallback) {
      super(callback);
      observers.push(this);
    }
  };
});
afterAll(() => {
  globalThis.MutationObserver = NativeObserver;
});

afterEach(() => {
  observers.splice(0).forEach((observer) => observer.disconnect());
  document.body.innerHTML = '';
  delete document.documentElement.dataset.lens;
});

describe('lensBootScript', () => {
  it('stays small and makes no external calls', () => {
    const script = lensBootScript();
    expect(Buffer.byteLength(script)).toBeLessThan(400);
    expect(script).not.toMatch(/fetch|XMLHttpRequest|http|import/);
    expect(script).toContain(`'${lensConfig.storageKey}'`);
  });

  it('applies the same thresholds as resolveLens()', () => {
    for (const score of [-6, -3, -2, -1, 0, 1, 2, 3, 6]) {
      const expected = resolveLens({ ...emptyLensState(), score });
      boot(JSON.stringify({ ...emptyLensState(), score }));
      const stamped = document.documentElement.dataset.lens;
      expect(stamped, `score ${score}`).toBe(expected === 'neutral' ? undefined : expected);
      delete document.documentElement.dataset.lens;
    }
  });

  it('sets no lens when storage is empty, garbage, or throws', async () => {
    for (const [stored, throws] of [
      [null, false],
      ['{oops', false],
      [JSON.stringify({ score: 'high' }), false],
      ['{"score":5}', true],
    ] as const) {
      boot(stored, throws);
      expect(document.documentElement.dataset.lens).toBeUndefined();
    }
    expect(await parseBody()).toEqual(['a-nb', 'b-n']);
  });

  it('reveals a stored framing as the body is parsed, before paint', async () => {
    boot(JSON.stringify({ ...emptyLensState(), score: 3 }));
    expect(await parseBody()).toEqual(['a-t', 'b-t']);
  });

  it('keeps nodes added later (client navigation) on the lens', async () => {
    boot(JSON.stringify({ ...emptyLensState(), score: -3 }));
    await parseBody();
    const late = document.createElement('div');
    late.innerHTML =
      '<span data-for="neutral">c-n</span><span data-for="beneficiary" hidden="">c-b</span>';
    document.body.append(late);
    await Promise.resolve();
    expect(visibleText()).toEqual(['a-nb', 'b-b', 'c-b']);
  });

  it('survives the reading-options script running after it as a classic global script', async () => {
    // Regression: both <head> scripts once declared `var d` at global scope, so the
    // reading-options script replaced the `document` the observer later read.
    const globalEval = eval;
    window.localStorage.setItem(
      lensConfig.storageKey,
      JSON.stringify({ ...emptyLensState(), score: 3 }),
    );
    try {
      globalEval(lensBootScript());
      globalEval(a11yBootScript());
      expect(await parseBody()).toEqual(['a-t', 'b-t']);
    } finally {
      window.localStorage.removeItem(lensConfig.storageKey);
    }
  });

  it('agrees with syncLensSlots() for every lens', async () => {
    boot(null);
    for (const lens of LENSES) {
      document.documentElement.dataset.lens = lens;
      const fromBoot = await parseBody();
      syncLensSlots(document, lens);
      expect(fromBoot, lens).toEqual(visibleText());
    }
  });
});
