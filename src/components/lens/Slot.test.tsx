// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderVariants, Slot } from './Slot';

afterEach(cleanup);

function variantsOf(container: HTMLElement, name: string) {
  return [...container.querySelectorAll(`[data-slot="${name}"]`)].map((el) => ({
    lenses: el.getAttribute('data-for'),
    text: el.textContent,
    html: el.innerHTML,
  }));
}

describe('Slot', () => {
  it('renders every lens and shares one element between equal strings', () => {
    const { container } = render(
      <Slot name="t" variants={{ neutral: 'same', trustee: 'other', beneficiary: 'same' }} />,
    );
    expect(variantsOf(container, 't')).toEqual([
      { lenses: 'neutral beneficiary', text: 'same', html: 'same' },
      { lenses: 'trustee', text: 'other', html: 'other' },
    ]);
  });

  it('falls back to neutral for a missing framing and renders null as an empty element', () => {
    const { container } = render(<Slot name="s" variants={{ neutral: null, trustee: 'x' }} />);
    expect(variantsOf(container, 's')).toEqual([
      { lenses: 'neutral beneficiary', text: '', html: '' },
      { lenses: 'trustee', text: 'x', html: 'x' },
    ]);
  });

  it('turns [label](href) into a link and *word* into the em-word', () => {
    const { container } = render(
      <Slot
        name="l"
        variants={{ neutral: 'Go *now* to [the wizard](/how-long-do-i-have/).' }}
        linkClassName="u"
      />,
    );
    const [only] = variantsOf(container, 'l');
    expect(only.lenses).toBe('neutral trustee beneficiary');
    // Outside a real build next/link drops the trailing slash; the export keeps it (trailingSlash: true).
    expect(only.html).toMatch(
      /^Go <em class="em-word">now<\/em> to <a class="u" href="\/how-long-do-i-have\/?">the wizard<\/a>\.$/,
    );
  });

  it('renders nodes through renderVariants once per distinct value', () => {
    const shared = { id: 1 };
    let renders = 0;
    const variants = renderVariants(
      { neutral: shared, trustee: { id: 2 }, beneficiary: shared },
      (v) => {
        renders += 1;
        return <b>{v.id}</b>;
      },
    );
    expect(renders).toBe(2);
    const { container } = render(<Slot name="n" as="div" variants={variants} />);
    expect(variantsOf(container, 'n')).toEqual([
      { lenses: 'neutral beneficiary', text: '1', html: '<b>1</b>' },
      { lenses: 'trustee', text: '2', html: '<b>2</b>' },
    ]);
    expect(container.querySelector('div[data-slot="n"]')).not.toBeNull();
  });
});
