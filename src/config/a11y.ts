/**
 * Reading options (docs/ACCESSIBILITY.md): four choices a visitor can make
 * from the header, stamped on <html> as data attributes and remembered in
 * localStorage. The first value of each option is the default and is never
 * stored or stamped, so the plain site is what crawlers and first-time
 * visitors get. CSS for each value lives in globals.css.
 */

export const A11Y_STORAGE_KEY = 'rl-a11y';

/** dataset keys: `textSize` becomes html[data-text-size], and so on. */
export type A11yKey = 'textSize' | 'contrast' | 'motion' | 'spacing';

export interface A11yValue {
  value: string;
  label: string;
}

export interface A11yOption {
  key: A11yKey;
  label: string;
  /** One plain sentence under the label. */
  hint: string;
  /** The default first. */
  values: readonly A11yValue[];
}

export const a11yOptions: readonly A11yOption[] = [
  {
    key: 'textSize',
    label: 'Text size',
    hint: 'Makes every word on the site bigger.',
    values: [
      { value: 'normal', label: 'Normal' },
      { value: 'large', label: 'Large' },
      { value: 'larger', label: 'Larger' },
    ],
  },
  {
    key: 'contrast',
    label: 'Contrast',
    hint: 'Darker text and stronger lines.',
    values: [
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    key: 'motion',
    label: 'Motion',
    hint: 'Turns off the small animations.',
    values: [
      { value: 'full', label: 'Full' },
      { value: 'reduced', label: 'Reduced' },
    ],
  },
  {
    key: 'spacing',
    label: 'Spacing',
    hint: 'More room between lines and paragraphs.',
    values: [
      { value: 'normal', label: 'Normal' },
      { value: 'wider', label: 'Wider' },
    ],
  },
] as const;

export function a11yOption(key: A11yKey): A11yOption {
  const option = a11yOptions.find((o) => o.key === key);
  if (!option) throw new Error(`No reading option "${key}"`);
  return option;
}

export function a11yDefault(key: A11yKey): string {
  return a11yOption(key).values[0].value;
}
