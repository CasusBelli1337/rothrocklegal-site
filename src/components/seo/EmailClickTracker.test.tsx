// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailClickTracker, isEmailLinkClick } from './EmailClickTracker';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  delete (window as Window & { gtag?: unknown }).gtag;
});

describe('EmailClickTracker', () => {
  it('counts a click on a mailto: link, including on an element inside it, and sends no address', () => {
    const gtag = vi.fn();
    (window as Window & { gtag?: unknown }).gtag = gtag;
    render(<EmailClickTracker />);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a href="mailto:arothrock@rothrocklegal.com"><span id="inner">Email us</span></a><a href="/library/" id="other">Library</a>',
    );
    fireEvent.click(document.getElementById('inner') as HTMLElement);
    fireEvent.click(document.getElementById('other') as HTMLElement);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'contact_email_click');
  });

  it('ignores clicks that are not on an email link', () => {
    expect(isEmailLinkClick(null)).toBe(false);
    const link = document.createElement('a');
    link.href = 'https://example.com/';
    expect(isEmailLinkClick(link)).toBe(false);
  });
});
