// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderVariants, Slot } from './Slot';

afterEach(cleanup);

function variantsOf(container: HTMLElement, name: string) {
  return [...container.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)].map((el) => ({
    lenses: el.getAttribute('data-for'),
    hidden: el.hidden,
    text: el.textContent,
    html: el.innerHTML,
  }));
}

describe('Slot', () => {
  it('renders every lens, shares one element between equal strings, and hides all but neutral', () => {
    const { container } = render(
      <Slot name="t" variants={{ neutral: 'same', trustee: 'other', beneficiary: 'same' }} />,
    );
    expect(variantsOf(container, 't')).toEqual([
      { lenses: 'neutral beneficiary', hidden: false, text: 'same', html: 'same' },
      { lenses: 'trustee', hidden: true, text: 'other', html: 'other' },
    ]);
  });

  it('hides each of three distinct non-neutral framings', () => {
    const { container } = render(
      <Slot name="d" as="div" variants={{ neutral: 'n', trustee: 't', beneficiary: 'b' }} />,
    );
    expect(variantsOf(container, 'd').map(({ lenses, hidden }) => [lenses, hidden])).toEqual([
      ['neutral', false],
      ['trustee', true],
      ['beneficiary', true],
    ]);
    expect(container.querySelector('[hidden]')?.outerHTML).toMatch(/^<div[^>]* hidden="">/);
  });

  it('falls back to neutral for a missing framing and renders null as an empty element', () => {
    const { container } = render(<Slot name="s" variants={{ neutral: null, trustee: 'x' }} />);
    expect(variantsOf(container, 's')).toEqual([
      { lenses: 'neutral beneficiary', hidden: false, text: '', html: '' },
      { lenses: 'trustee', hidden: true, text: 'x', html: 'x' },
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
      { lenses: 'neutral beneficiary', hidden: false, text: '1', html: '<b>1</b>' },
      { lenses: 'trustee', hidden: true, text: '2', html: '<b>2</b>' },
    ]);
    expect(container.querySelector('div[data-slot="n"]')).not.toBeNull();
  });
});
