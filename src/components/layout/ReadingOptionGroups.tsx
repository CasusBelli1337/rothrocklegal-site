'use client';

import type { A11yKey, A11yOption } from '@/config/a11y';
import { a11yOptions } from '@/config/a11y';
import { a11yValue } from '@/lib/a11y/store';
import { useReadingPrefs } from '@/lib/a11y/useReadingPrefs';

interface GroupProps {
  option: A11yOption;
  value: string;
  onChoose: (key: A11yKey, value: string) => void;
}

const chipClass =
  'relative inline-flex h-11 cursor-pointer items-center justify-center border border-line-strong bg-white px-4 ' +
  'text-body font-medium text-ink transition-colors duration-150 hover:border-maroon-700 ' +
  'has-[:checked]:border-maroon-900 has-[:checked]:bg-maroon-900 has-[:checked]:text-white ' +
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-maroon-500';

/** One option: a labelled group of real radios drawn as chips, so the choice is obvious and keyboard-operable. */
function ReadingOptionGroup({ option, value, onChoose }: GroupProps) {
  const hintId = `reading-${option.key}-hint`;
  return (
    <fieldset aria-describedby={hintId} className="min-w-0">
      <legend className="text-body font-semibold text-ink">{option.label}</legend>
      <p id={hintId} className="mt-0.5 text-small text-ink-3">
        {option.hint}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {option.values.map((choice) => (
          <label key={choice.value} className={chipClass}>
            <input
              type="radio"
              name={`reading-${option.key}`}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChoose(option.key, choice.value)}
              // The radio itself fills the chip (44px tall), so the whole chip is the real target.
              className="absolute -inset-px m-0 cursor-pointer opacity-0"
            />
            {choice.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface ReadingOptionGroupsProps {
  /** Rendered after the groups, e.g. the Reset and Done buttons. */
  actions?: (state: { changed: boolean; reset: () => void }) => React.ReactNode;
  className?: string;
}

/** The four reading options (src/config/a11y.ts); shared by the header bar and /accessibility/. */
export function ReadingOptionGroups({ actions, className = '' }: ReadingOptionGroupsProps) {
  const { prefs, choose, reset, changed } = useReadingPrefs();
  return (
    <div
      className={`flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between ${className}`}
    >
      <div className="grid flex-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {a11yOptions.map((option) => (
          <ReadingOptionGroup
            key={option.key}
            option={option}
            value={a11yValue(prefs, option.key)}
            onChoose={choose}
          />
        ))}
      </div>
      {actions?.({ changed, reset })}
    </div>
  );
}
