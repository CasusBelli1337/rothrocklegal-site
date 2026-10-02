'use client';

import { useState } from 'react';
import {
  type ConsentCategory,
  consentCategory,
  offeredCategories,
  type OptionalCategory,
} from '@/config/consent';
import { consentCategoryCopy, consentCopy } from '@/config/consent-copy';
import type { ConsentState, PrivacySignal } from '@/lib/consent/store';
import { choiceButtonClass } from './styles';

interface SwitchProps {
  category: ConsentCategory;
  checked: boolean;
  /** Set for the always-on row and for a category a privacy signal keeps off. */
  locked?: string;
  onChange?: (value: boolean) => void;
}

/** One category: a real checkbox with role="switch", its on/off word, and a plain-English sentence. */
function CategorySwitch({ category, checked, locked, onChange }: SwitchProps) {
  const copy = consentCategoryCopy[category.key];
  const descriptionId = `consent-${category.key}-description`;
  return (
    <li className="border border-line bg-white p-4">
      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 has-[:disabled]:cursor-default">
        <span className="text-body font-semibold text-ink">{copy.label}</span>
        <span className="flex shrink-0 items-center gap-3">
          <span aria-hidden="true" className="text-body text-ink-2">
            {locked ?? (checked ? consentCopy.on : consentCopy.off)}
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={locked !== undefined}
            onChange={(event) => onChange?.(event.target.checked)}
            aria-describedby={descriptionId}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={
              'relative inline-flex h-7 w-12 items-center border-2 border-ink-3 bg-white p-0.5 ' +
              'peer-checked:border-maroon-900 peer-checked:bg-maroon-900 peer-[:disabled:not(:checked)]:opacity-60 ' +
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-maroon-500 ' +
              'peer-checked:[&>span]:translate-x-5 peer-checked:[&>span]:bg-white'
            }
          >
            <span className="h-5 w-5 bg-ink-3 transition-transform duration-150" />
          </span>
        </span>
      </label>
      <p id={descriptionId} className="mt-1 text-body text-ink-2">
        {copy.description}
      </p>
    </li>
  );
}

interface ChoicesProps {
  id: string;
  initial: ConsentState;
  signal: PrivacySignal;
  onSave: (choice: ConsentState) => void;
}

/**
 * The "Choose" panel, inline under the bar's buttons (never a modal): the
 * always-on row, then a switch for each category that has a vendor today
 * (config/consent.ts), then "Save choices".
 */
export function ConsentChoices({ id, initial, signal, onSave }: ChoicesProps) {
  const [draft, setDraft] = useState<ConsentState>(initial);
  const set = (key: OptionalCategory) => (value: boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));
  return (
    <div id={id} className="mt-4 border-t border-line pt-4">
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <CategorySwitch
          category={consentCategory('necessary')}
          checked
          locked={consentCopy.alwaysOn}
        />
        {offeredCategories().map((category) => {
          const key = category.key as OptionalCategory;
          const blocked = category.saleOrShare && signal !== null;
          return (
            <CategorySwitch
              key={key}
              category={category}
              checked={!blocked && draft[key]}
              locked={blocked ? consentCategoryCopy[key].signalOff : undefined}
              onChange={set(key)}
            />
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => onSave(draft)}
        className={`${choiceButtonClass} mt-4 w-full sm:w-auto sm:px-8`}
      >
        {consentCopy.save}
      </button>
    </div>
  );
}
