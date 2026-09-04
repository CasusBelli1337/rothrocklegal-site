// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { panelScrollTarget, prefersReducedMotion, revealPanel } from './scroll';

function page(options: {
  panelTop: number;
  headerHeight: number;
  scrollY: number;
  motion?: string;
}) {
  document.body.innerHTML =
    '<header></header><div id="panel"><h2 id="heading" tabindex="-1">Step</h2></div>';
  const header = document.querySelector('header') as HTMLElement;
  const panel = document.getElementById('panel') as HTMLElement;
  const heading = document.getElementById('heading') as HTMLElement;
  header.getBoundingClientRect = () => ({ height: options.headerHeight, top: 0 }) as DOMRect;
  panel.getBoundingClientRect = () => ({ top: options.panelTop, height: 900 }) as DOMRect;
  Object.defineProperty(window, 'scrollY', { value: options.scrollY, configurable: true });
  if (options.motion) document.documentElement.dataset.motion = options.motion;
  else delete document.documentElement.dataset.motion;
  const scrollTo = vi.fn();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  return { panel, heading, scrollTo };
}

describe('panelScrollTarget', () => {
  it('puts the panel under the header with a little air, never above the page top', () => {
    const env = { scrollY: 400, panelTop: -120, headerHeight: 72, reducedMotion: false };
    expect(panelScrollTarget(env)).toBe(400 - 120 - 72 - 16);
    expect(panelScrollTarget({ ...env, scrollY: 0, panelTop: 40 })).toBe(0);
  });
});

describe('revealPanel', () => {
  it('scrolls to the panel, not the top of the page, and focuses the heading in place', () => {
    const { panel, heading, scrollTo } = page({ panelTop: -300, headerHeight: 72, scrollY: 800 });
    const focus = vi.spyOn(heading, 'focus');
    revealPanel(panel, heading);
    expect(scrollTo).toHaveBeenCalledWith({ top: 800 - 300 - 72 - 16, behavior: 'smooth' });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('uses an instant scroll when the person chose reduced motion', () => {
    const { panel, heading, scrollTo } = page({
      panelTop: 500,
      headerHeight: 60,
      scrollY: 0,
      motion: 'reduced',
    });
    revealPanel(panel, heading);
    expect(scrollTo).toHaveBeenCalledWith({ top: 500 - 60 - 16, behavior: 'auto' });
  });

  it('honors the system reduced-motion setting too', () => {
    page({ panelTop: 0, headerHeight: 0, scrollY: 0 });
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(prefersReducedMotion(document, window)).toBe(true);
    window.matchMedia = () => {
      throw new Error('unsupported');
    };
    expect(prefersReducedMotion(document, window)).toBe(false);
  });

  it('still focuses the heading when the panel is not mounted', () => {
    const { heading, scrollTo } = page({ panelTop: 0, headerHeight: 0, scrollY: 0 });
    const focus = vi.spyOn(heading, 'focus');
    revealPanel(null, heading);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });
});
