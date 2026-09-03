// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './Reveal';

class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  constructor(public callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {}
}

function stubViewport({ top, reduceMotion = false }: { top: number; reduceMotion?: boolean }) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 100,
    height: 100,
    width: 100,
    left: 0,
    right: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: reduceMotion }) as typeof window.matchMedia;
}

beforeEach(() => {
  FakeObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeObserver);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Reveal', () => {
  it('leaves content that is already in view visible and unobserved', () => {
    stubViewport({ top: 200 });
    const { container } = render(<Reveal>text</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains('is-armed')).toBe(false);
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it('arms content below the viewport and reveals it once it intersects', () => {
    stubViewport({ top: 5000 });
    const { container } = render(<Reveal stagger>text</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains('is-armed')).toBe(true);
    expect(el.classList.contains('is-visible')).toBe(false);
    const observer = FakeObserver.instances[0];
    expect(observer.observed).toEqual([el]);
    observer.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
    expect(el.classList.contains('is-visible')).toBe(true);
  });

  it('never hides anything for readers who prefer reduced motion', () => {
    stubViewport({ top: 5000, reduceMotion: true });
    const { container } = render(<Reveal>text</Reveal>);
    expect((container.firstElementChild as HTMLElement).classList.contains('is-armed')).toBe(false);
    expect(FakeObserver.instances).toHaveLength(0);
  });
});
