// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getTeamMember } from '@/config/team';
import { ArticlesByMember } from './ArticlesByMember';

afterEach(cleanup);

describe('ArticlesByMember', () => {
  it("lists Arthur's articles in the configured order with a count line and the library link", () => {
    const arthur = getTeamMember('arthur-rothrock');
    const { container, getByRole } = render(<ArticlesByMember member={arthur} />);
    expect(getByRole('heading', { level: 2 }).textContent).toBe(
      'Arthur wrote every article in our library.',
    );
    const rows = [...container.querySelectorAll<HTMLAnchorElement>('ol a')];
    expect(rows).toHaveLength(arthur.writing?.shown ?? 0);
    expect(rows[0].getAttribute('href')).toMatch(
      /^\/library\/how-long-do-i-have-to-contest-a-trust-or-will-in-california\/?$/,
    );
    expect(rows[0].textContent).toContain('Deadlines');
    expect(container.textContent).toMatch(/10 of \d+ articles/);
    const seeAll = getByRole('link', { name: /See all articles/ });
    expect(seeAll.getAttribute('href')).toMatch(/^\/library\/?$/);
  });

  it('links the pieces elsewhere in the same tab with rel="noopener"', () => {
    const { container } = render(<ArticlesByMember member={getTeamMember('arthur-rothrock')} />);
    const external = [...container.querySelectorAll<HTMLAnchorElement>('ul a')];
    expect(external.length).toBeGreaterThan(0);
    expect(external.length).toBeLessThanOrEqual(6);
    for (const link of external) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\/legion\.law\/library\//);
      expect(link.getAttribute('rel')).toBe('noopener');
      expect(link.hasAttribute('target')).toBe(false);
      expect(link.textContent).toContain('legion.law');
    }
  });

  it('renders nothing for a member without a writing section', () => {
    const { container } = render(<ArticlesByMember member={getTeamMember('gerry-lin')} />);
    expect(container.innerHTML).toBe('');
  });
});
