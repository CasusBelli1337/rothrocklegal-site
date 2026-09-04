import type { Option } from './FormFields';

interface ChoiceCardsProps<T extends string> {
  name: string;
  legend: string;
  /** Screen-reader-only legend, for when the question is already shown above (follow-up modules). */
  hideLegend?: boolean;
  hint?: string;
  optional?: boolean;
  options: readonly Option<T>[];
  /** Single value for radios, an array for checkboxes. */
  value: T | '' | readonly T[];
  onChange(value: T, checked: boolean): void;
  columns?: 1 | 2;
  /** Input-height cards with the label's spacing, for a choice that sits in a row of text fields. */
  compact?: boolean;
}

/**
 * Real radios (single value) or checkboxes (array value) inside the wizard's
 * choice cards, so keyboard and screen-reader users get native controls.
 */
export function ChoiceCards<T extends string>({
  name,
  legend,
  hideLegend,
  hint,
  optional,
  options,
  value,
  onChange,
  columns = 1,
  compact = false,
}: ChoiceCardsProps<T>) {
  const multi = Array.isArray(value);
  const selected = (option: T) =>
    multi ? (value as readonly T[]).includes(option) : value === option;
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <fieldset aria-describedby={hintId}>
      <legend className={hideLegend ? 'sr-only' : 'text-small font-medium text-ink'}>
        {legend}
        {optional && <span className="ml-1 font-normal text-ink-3">(optional)</span>}
      </legend>
      {hint && (
        <p id={hintId} className="mt-1 text-small text-ink-3">
          {hint}
        </p>
      )}
      <div
        className={`${hideLegend ? '' : compact ? 'mt-1.5' : 'mt-3'} grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}
      >
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const checked = selected(option.value);
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`wizard-choice ${compact ? 'is-compact' : ''} ${checked ? 'is-selected' : ''}`}
            >
              <input
                id={id}
                type={multi ? 'checkbox' : 'radio'}
                name={name}
                value={option.value}
                checked={checked}
                onChange={(event) => onChange(option.value, event.target.checked)}
              />
              <span className="text-body text-ink">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
