/** Shared form primitives for the intake steps (DESIGN-BRIEF §6 "Form field"). */

export const inputClass =
  'h-12 w-full border border-line-strong bg-white px-3 text-body text-ink placeholder:text-ink-4 ' +
  'focus:border-maroon-700 focus:outline-none focus:ring-2 focus:ring-maroon-700/30 disabled:bg-sand disabled:text-ink-3';

export const labelClass = 'block text-small font-medium text-ink';

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function hintId(id: string): string {
  return `${id}-hint`;
}

/** Visible label above the control, optional hint wired through `aria-describedby`. */
export function Field({ id, label, hint, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <span className="ml-1 font-normal text-ink-3">(optional)</span>}
      </label>
      {hint && (
        <p id={hintId(id)} className="mt-1 text-small text-ink-3">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

interface TextInputProps {
  id: string;
  value: string;
  onChange(value: string): void;
  onBlur?(): void;
  type?: 'text' | 'email' | 'tel' | 'date';
  autoComplete?: string;
  placeholder?: string;
  describedBy?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function TextInput({
  id,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  placeholder,
  describedBy,
  disabled,
  maxLength,
  className = '',
}: TextInputProps) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      autoComplete={autoComplete}
      placeholder={placeholder}
      aria-describedby={describedBy}
      disabled={disabled}
      maxLength={maxLength}
      max={type === 'date' ? '2099-12-31' : undefined}
      className={`${inputClass} ${type === 'date' ? 'tabular sm:max-w-[18rem]' : ''} ${className}`}
    />
  );
}

interface SelectInputProps<T extends string> {
  id: string;
  value: T | '';
  onChange(value: T | ''): void;
  options: readonly Option<T>[];
  placeholder?: string;
  describedBy?: string;
}

export function SelectInput<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = 'Choose one',
  describedBy,
}: SelectInputProps<T>) {
  return (
    <select
      id={id}
      name={id}
      value={value}
      onChange={(event) => onChange(event.target.value as T | '')}
      aria-describedby={describedBy}
      className={inputClass}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface TextAreaProps {
  id: string;
  value: string;
  onChange(value: string): void;
  rows?: number;
  placeholder?: string;
  describedBy?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

export function TextArea({
  id,
  value,
  onChange,
  rows = 4,
  placeholder,
  describedBy,
  textareaRef,
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      name={id}
      ref={textareaRef}
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-describedby={describedBy}
      className={`${inputClass} h-auto py-3`}
    />
  );
}

interface CheckboxRowProps {
  id: string;
  checked: boolean;
  onChange(checked: boolean): void;
  children: React.ReactNode;
  /** Card-style row (start-screen acknowledgments) instead of an inline checkbox. */
  card?: boolean;
  /** Tighter padding and `text-small`, for a card that must fit a laptop screen with two others. */
  dense?: boolean;
  className?: string;
}

export function CheckboxRow({
  id,
  checked,
  onChange,
  children,
  card,
  dense,
  className = '',
}: CheckboxRowProps) {
  const frame = card
    ? `flex cursor-pointer gap-3 border bg-white ${dense ? 'p-3' : 'p-4'} transition-colors ${checked ? 'border-maroon-700 bg-sand' : 'border-line-strong hover:border-maroon-500'}`
    : 'inline-flex cursor-pointer items-center gap-2 py-2';
  return (
    <label
      htmlFor={id}
      className={`${frame} ${className} ${dense ? 'text-small' : 'text-body'} text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-maroon-700`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-maroon-900"
      />
      <span>{children}</span>
    </label>
  );
}
