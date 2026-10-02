// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { consentConfig } from '@/config/consent';
import { consentCopy } from '@/config/consent-copy';
import { closeConsentPanel, refreshConsent } from '@/lib/consent/client';
import { ConsentBanner } from './ConsentBanner';

const route = vi.hoisted(() => ({ pathname: '/request-a-consult/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

/** jsdom lays nothing out: the bar is 180px tall, 57px higher where it sits on the mobile consult bar. */
const BAR_HEIGHT = 180;
const CONSULT_BAR = 57;
const layout = { fraction: 0 };

function isBar(el: HTMLElement): boolean {
  return el.id === consentConfig.barId;
}

function property(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

beforeEach(() => {
  localStorage.clear();
  route.pathname = '/request-a-consult/';
  layout.fraction = 0;
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return isBar(this) ? BAR_HEIGHT : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const lift = this.className.includes('3.5rem') ? CONSULT_BAR : 0;
    const top = isBar(this) ? window.innerHeight - BAR_HEIGHT - lift - layout.fraction : 0;
    return {
      top,
      bottom: top + BAR_HEIGHT,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: top,
      toJSON: () => ({}),
    };
  });
  act(() => refreshConsent());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  act(() => closeConsentPanel());
});

describe('privacy-choices bar insets', () => {
  it('publishes its height and the viewport it covers while it is open', () => {
    render(<ConsentBanner />);
    expect(property('--consent-bar-h')).toBe(`${BAR_HEIGHT}px`);
    expect(property('--consent-cover')).toBe(`${BAR_HEIGHT}px`);
  });

  it('clears both once a choice is made', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: consentCopy.decline }));
    expect(property('--consent-bar-h')).toBe('');
    expect(property('--consent-cover')).toBe('');
  });

  it('measures again when a page change moves the bar above the mobile consult bar', () => {
    const { rerender } = render(<ConsentBanner />);
    expect(property('--consent-cover')).toBe(`${BAR_HEIGHT}px`);
    route.pathname = '/trust-contests/';
    rerender(<ConsentBanner />);
    expect(property('--consent-cover')).toBe(`${BAR_HEIGHT + CONSULT_BAR}px`);
    expect(property('--consent-bar-h')).toBe(`${BAR_HEIGHT}px`);
  });

  it('rounds the cover down, so no hairline of page shows between the two bars', () => {
    layout.fraction = 0.6;
    render(<ConsentBanner />);
    expect(property('--consent-cover')).toBe(`${BAR_HEIGHT}px`);
  });

  it("keeps the consult flow's sticky action bar above it", () => {
    const css = readFileSync(join(process.cwd(), 'src/components/intake/intake.css'), 'utf8');
    const rule = css.match(/\.intake-bar \{[^}]*\}/)?.[0] ?? '';
    expect(rule).toContain('position: sticky;');
    expect(rule).toContain('bottom: var(--consent-cover, 0px);');
  });
});
