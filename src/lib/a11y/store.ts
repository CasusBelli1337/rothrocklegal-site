import { A11Y_STORAGE_KEY, a11yDefault, a11yOptions, type A11yKey } from '@/config/a11y';

/**
 * Reading-option state: only non-default choices, keyed like the <html>
 * dataset. Every storage touch is wrapped so private mode or a blocked origin
 * simply leaves the plain site. The pure pieces take their inputs as arguments.
 */
export type A11yPrefs = Partial<Record<A11yKey, string>>;

/** A plain `{ [key]: value }` record with a `dataset`-like shape; DOMStringMap fits. */
type DatasetLike = Record<string, string | undefined>;

function isKnown(key: string, value: unknown): value is string {
  const option = a11yOptions.find((o) => o.key === key);
  return (
    option !== undefined &&
    typeof value === 'string' &&
    value !== option.values[0].value &&
    option.values.some((v) => v.value === value)
  );
}

/** Drops unknown keys, unknown values, and defaults, so the result is always safe to stamp. */
export function normalizeA11yPrefs(input: unknown): A11yPrefs {
  const prefs: A11yPrefs = {};
  if (typeof input !== 'object' || input === null) return prefs;
  for (const [key, value] of Object.entries(input)) {
    if (isKnown(key, value)) prefs[key as A11yKey] = value;
  }
  return prefs;
}

/** The value in effect for one option (the default when nothing is set). */
export function a11yValue(prefs: A11yPrefs, key: A11yKey): string {
  return prefs[key] ?? a11yDefault(key);
}

/** Returns a copy with `key` set; choosing the default removes the key. */
export function withA11yPref(prefs: A11yPrefs, key: A11yKey, value: string): A11yPrefs {
  const next = { ...prefs, [key]: value };
  return normalizeA11yPrefs(next);
}

function storageOf(storage?: Storage): Storage | undefined {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadA11yPrefs(storage?: Storage): A11yPrefs {
  try {
    const raw = storageOf(storage)?.getItem(A11Y_STORAGE_KEY);
    return raw ? normalizeA11yPrefs(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

/** Nothing chosen removes the key outright, so a reset leaves no trace. */
export function saveA11yPrefs(prefs: A11yPrefs, storage?: Storage): void {
  try {
    const store = storageOf(storage);
    if (Object.keys(prefs).length === 0) store?.removeItem(A11Y_STORAGE_KEY);
    else store?.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
}

/** Stamps every option on the root dataset; unset options lose their attribute. */
export function applyA11yPrefs(prefs: A11yPrefs, dataset: DatasetLike): void {
  for (const option of a11yOptions) {
    const value = prefs[option.key];
    if (value) dataset[option.key] = value;
    else delete dataset[option.key];
  }
}

/** What the boot script (or a previous change) already stamped on <html>. */
export function readA11yPrefs(dataset: DatasetLike): A11yPrefs {
  const found: Record<string, string | undefined> = {};
  for (const option of a11yOptions) found[option.key] = dataset[option.key];
  return normalizeA11yPrefs(found);
}

const listeners = new Set<() => void>();

/** Several controls can show the same options (header bar, /accessibility/); each hears every change. */
export function subscribeA11y(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The one write path: stamp <html>, remember it, tell every control. */
export function commitA11yPrefs(prefs: A11yPrefs): void {
  applyA11yPrefs(prefs, document.documentElement.dataset);
  saveA11yPrefs(prefs);
  listeners.forEach((listener) => listener());
}
