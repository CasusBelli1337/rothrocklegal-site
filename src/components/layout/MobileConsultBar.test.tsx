// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { consultCta } from '@/config/site';
import { MobileConsultBar } from './MobileConsultBar';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

afterEach(cleanup);

/** The fixed bar wraps the link; `hidden` on it is what steps aside for the keyboard. */
function bar(container: HTMLElement): HTMLElement {
  return container.querySelector('a')!.parentElement as HTMLElement;
}

describe('MobileConsultBar', () => {
  it('shows the consult link on ordinary pages', () => {
    route.pathname = '/about/';
    render(<MobileConsultBar />);
    expect(screen.getByRole('link', { name: consultCta.label })).toBeTruthy();
  });

  it('stays off the pages that carry the action themselves', () => {
    route.pathname = consultCta.href;
    const { container } = render(<MobileConsultBar />);
    expect(container.querySelector('a')).toBeNull();
  });

  it('stays off the emailed-link pages, where it would cover the signature block', () => {
    route.pathname = '/sign/';
    const { container } = render(<MobileConsultBar />);
    expect(container.querySelector('a')).toBeNull();
  });

  it('steps aside while a text field has focus and returns on blur', () => {
    route.pathname = '/';
    const { container } = render(
      <>
        <input aria-label="Name" />
        <input type="radio" aria-label="Yes" />
        <MobileConsultBar />
      </>,
    );
    expect(bar(container).hidden).toBe(false);
    fireEvent.focusIn(screen.getByLabelText('Name'));
    expect(bar(container).hidden).toBe(true);
    fireEvent.focusOut(screen.getByLabelText('Name'));
    expect(bar(container).hidden).toBe(false);
    // Radios open no keyboard, so the bar stays.
    fireEvent.focusIn(screen.getByLabelText('Yes'));
    expect(bar(container).hidden).toBe(false);
  });
});
