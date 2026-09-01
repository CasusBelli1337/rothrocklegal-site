import { createElement, Fragment, type ReactNode } from 'react';

/**
 * Line-break hygiene for statute-heavy copy. Applied where config strings and
 * markdown render, so "Probate Code § 16061.8" never ends a line on the "§".
 */

/** "§ 850" / "§§ 16060" → the number stays glued to its section sign (non-breaking space). */
export function bindSectionSigns(text: string): string {
  return text.replace(/(§+)\s+(?=[\d(])/g, '$1 ');
}

const COMPOUND = /([A-Za-z]+(?:-[A-Za-z]+)+)/g;

/** Keeps hyphenated words ("co-owner", "attorney-client") on one line inside balanced headlines. */
export function keepCompounds(text: string): ReactNode {
  const parts = text.split(COMPOUND);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1
      ? createElement('span', { key: i, className: 'whitespace-nowrap' }, part)
      : createElement(Fragment, { key: i }, part),
  );
}
