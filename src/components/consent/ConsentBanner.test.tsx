// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { consentConfig } from '@/config/consent';
import { consentCopy, counterCopy, privacyChoicesLabels } from '@/config/consent-copy';
import { closeConsentPanel, hasConsent, refreshConsent } from '@/lib/consent/client';
import { recordOf } from '@/lib/consent/testing';
import { ConsentBanner } from './ConsentBanner';
import { PrivacyChoicesButton } from './PrivacyChoicesButton';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

function bar(): HTMLElement {
  return document.getElementById(consentConfig.barId)!;
}

function renderPage() {
  return render(
    <>
      <ConsentBanner />
      <footer>
        <PrivacyChoicesButton />
      </footer>
    </>,
  );
}

beforeEach(() => {
  localStorage.clear();
  route.pathname = '/';
  act(() => refreshConsent());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  act(() => closeConsentPanel());
});

describe('ConsentBanner', () => {
  it('shows on a first visit as a labelled region with three equal choices', () => {
    renderPage();
    const region = screen.getByRole('region', { name: consentCopy.eyebrow });
    expect(region.hidden).toBe(false);
    expect(region.hasAttribute('data-open')).toBe(true);
    for (const name of [consentCopy.accept, consentCopy.decline, consentCopy.choose]) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
    const classes = [consentCopy.accept, consentCopy.decline, consentCopy.choose].map(
      (name) => screen.getByRole('button', { name }).className,
    );
    expect(new Set(classes).size).toBe(1);
  });

  it("notes the firm's own visit count in the small print, never as a choice", () => {
    renderPage();
    expect(bar().textContent).toContain(counterCopy.barNote);
    fireEvent.click(screen.getByRole('button', { name: consentCopy.choose }));
    const switches = screen.getAllByRole('switch').map((s) => s.getAttribute('aria-label') ?? '');
    expect(switches.join(' ')).not.toMatch(/count/i);
    expect(screen.getAllByRole('switch')).toHaveLength(2);
  });

  it('hides after "Accept analytics" and grants analytics', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: consentCopy.accept }));
    expect(bar().hidden).toBe(true);
    expect(hasConsent('analytics')).toBe(true);
    expect(screen.getByRole('status').textContent).toBe(consentCopy.saved);
  });

  it('hides after "Decline" and keeps analytics off', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: consentCopy.decline }));
    expect(bar().hidden).toBe(true);
    expect(hasConsent('analytics')).toBe(false);
    expect(document.documentElement.dataset.consent).toBe('none');
  });

  it('declines on Escape', () => {
    renderPage();
    fireEvent.keyDown(screen.getByRole('button', { name: consentCopy.accept }), { key: 'Escape' });
    expect(bar().hidden).toBe(true);
    expect(hasConsent('analytics')).toBe(false);
    expect(localStorage.getItem(consentConfig.storageKey)).toContain('"granted":[]');
  });

  it('"Choose" expands the categories inline and "Save choices" saves the switches', () => {
    renderPage();
    const choose = screen.getByRole('button', { name: consentCopy.choose });
    fireEvent.click(choose);
    expect(choose.getAttribute('aria-expanded')).toBe('true');
    const necessary = screen.getByRole('switch', { name: 'Needed for the site' });
    expect((necessary as HTMLInputElement).checked).toBe(true);
    expect((necessary as HTMLInputElement).disabled).toBe(true);
    const analytics = screen.getByRole('switch', { name: /Analytics/ }) as HTMLInputElement;
    expect(analytics.checked).toBe(false);
    // Two categories today: no advertising toggle until an ad vendor is listed.
    expect(screen.getAllByRole('switch')).toHaveLength(2);
    fireEvent.click(analytics);
    fireEvent.click(screen.getByRole('button', { name: consentCopy.save }));
    expect(bar().hidden).toBe(true);
    expect(hasConsent('analytics')).toBe(true);
  });

  it('stays hidden for a returning visitor and reopens from the footer link', () => {
    localStorage.setItem(consentConfig.storageKey, JSON.stringify(recordOf({ granted: [] })));
    act(() => refreshConsent());
    renderPage();
    expect(bar().hidden).toBe(true);
    const link = screen.getByRole('button', { name: privacyChoicesLabels.standard });
    link.focus();
    fireEvent.click(link);
    expect(bar().hidden).toBe(false);
    expect(screen.getAllByRole('switch')).toHaveLength(2);
    expect(document.activeElement?.id).toBe(`${consentConfig.barId}-heading`);
    // Escape on a reopened bar closes it without changing the choice, and focus goes back.
    fireEvent.keyDown(bar(), { key: 'Escape' });
    expect(bar().hidden).toBe(true);
    expect(document.activeElement).toBe(link);
    expect(hasConsent('analytics')).toBe(false);
  });

  it('turns analytics on from the reopened panel', () => {
    localStorage.setItem(consentConfig.storageKey, JSON.stringify(recordOf({ granted: [] })));
    act(() => refreshConsent());
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: privacyChoicesLabels.standard }));
    fireEvent.click(screen.getByRole('switch', { name: /Analytics/ }));
    fireEvent.click(screen.getByRole('button', { name: consentCopy.save }));
    expect(hasConsent('analytics')).toBe(true);
    expect(bar().hidden).toBe(true);
  });

  it('says so when the browser sends Global Privacy Control', () => {
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    act(() => refreshConsent());
    renderPage();
    expect(bar().hidden).toBe(false);
    expect(bar().textContent).toContain('Global Privacy Control');
    expect(hasConsent('analytics')).toBe(false);
  });

  it('shows on the emailed-link pages too, at the very bottom (no consult bar there)', () => {
    route.pathname = '/sign/';
    renderPage();
    expect(bar().hidden).toBe(false);
    expect(bar().className).toContain('bottom-0');
    expect(bar().className).not.toContain('3.5rem');
  });

  it('stacks above the mobile consult bar where that shows', () => {
    route.pathname = '/trust-contests/';
    renderPage();
    expect(bar().className).toContain('bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))]');
  });
});
