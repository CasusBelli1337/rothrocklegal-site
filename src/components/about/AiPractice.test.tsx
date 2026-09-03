// @vitest-environment jsdom
import { existsSync } from 'node:fs';
import path from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AiPractice } from './AiPractice';

afterEach(cleanup);

describe('AiPractice', () => {
  it('makes the claim and shows the Legion mark with its caption', () => {
    const { container } = render(<AiPractice />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe("AI is in this firm's DNA.");
    const src = screen.getByRole('img', { name: 'Legion' }).getAttribute('src') ?? '';
    expect(src).toMatch(/\/images\/partners\/legion-logo\.svg$/);
    expect(existsSync(path.join(process.cwd(), 'public', src))).toBe(true);
    expect(container.querySelector('figcaption')?.textContent).toBe(
      'Legion, the AI litigation platform Arthur co-founded.',
    );
  });

  it('keeps the copy inside the voice rules', () => {
    const text = render(<AiPractice />).container.textContent ?? '';
    expect(text).not.toContain('\u2014');
    expect(text).not.toMatch(/\bexperts?\b|\bspecialists?\b/i);
    // Arthur, 2026-09-03: with 100,000-document productions nobody reads every page.
    expect(text).not.toMatch(/\b(reads?|reviews?) every (page|document)/i);
    expect(text).not.toMatch(/guarantee|will win|you will (get|recover)/i);
    // Legion is what the firm uses, never a pitch.
    expect(text).not.toMatch(/sign up|try legion|for lawyers|other firms can/i);
  });
});
