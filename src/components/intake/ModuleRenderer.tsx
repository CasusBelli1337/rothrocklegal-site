'use client';

import type { FollowUpAnswer, FollowUpModule } from '@/lib/intake/contract';
import { VALUE_RANGES } from '@/lib/intake/contract';
import { FOLLOW_UP_COPY, VALUE_RANGE_LABELS } from '@/lib/intake/copy';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { ChoiceCards } from './ChoiceCards';
import { inputClass, labelClass } from './FormFields';
import { UploadSlot } from './UploadSlot';
import { WhyWeAsk } from './WhyWeAsk';

export interface ModuleRendererProps {
  module: FollowUpModule;
  value: FollowUpAnswer | undefined;
  /** `null` = skipped for now; `undefined` = cleared (answer it after all). */
  onChange(value: FollowUpAnswer | undefined): void;
  uploads: UploadBinding;
}

type Answerable = Exclude<FollowUpModule, { type: 'info' }>;

/** Types with one control the shell's label can point at; groups and uploads name themselves. */
const LABELLED: ReadonlySet<Answerable['type']> = new Set([
  'short_text',
  'long_text',
  'date',
  'money_range',
]);

export function moduleDomId(id: string): string {
  return `fu-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function textOf(value: FollowUpAnswer | undefined): string {
  return typeof value === 'string' ? value : '';
}

const VALUE_OPTIONS = VALUE_RANGES.map((value) => ({ value, label: VALUE_RANGE_LABELS[value] }));

function SkipControls({
  skipped,
  onChange,
}: {
  skipped: boolean;
  onChange: ModuleRendererProps['onChange'];
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(skipped ? undefined : null)}
      className="tap-link shrink-0 text-small text-ink-3 underline underline-offset-3 hover:text-maroon-700"
    >
      {skipped ? FOLLOW_UP_COPY.answer : FOLLOW_UP_COPY.skip}
    </button>
  );
}

/** Question, optional mark, why, skip toggle, then the control (or the "skipped" note). */
function ModuleShell({
  module,
  value,
  onChange,
  children,
}: Omit<ModuleRendererProps, 'uploads' | 'module'> & {
  module: Answerable;
  children: React.ReactNode;
}) {
  const skipped = value === null;
  const id = moduleDomId(module.id);
  const label = (
    <>
      {module.label}
      <span className="ml-1 font-normal text-ink-3">
        {module.required ? FOLLOW_UP_COPY.helpsMost : FOLLOW_UP_COPY.optional}
      </span>
    </>
  );
  return (
    <div className="border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        {LABELLED.has(module.type) ? (
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
        ) : (
          <span className={labelClass}>{label}</span>
        )}
        <SkipControls skipped={skipped} onChange={onChange} />
      </div>
      <WhyWeAsk className="mt-1">{module.why}</WhyWeAsk>
      {skipped ? (
        <p className="mt-3 text-small text-ink-3">{FOLLOW_UP_COPY.skipped}</p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );
}

function ChoiceModule({
  module,
  value,
  onChange,
}: ModuleRendererProps & { module: Extract<Answerable, { type: 'choice' }> }) {
  const selected = module.multi ? (Array.isArray(value) ? value : []) : textOf(value);
  const options = module.options.map((option) => ({ value: option, label: option }));
  return (
    <ChoiceCards
      name={moduleDomId(module.id)}
      legend={module.label}
      hideLegend
      options={options}
      value={selected}
      onChange={(option, checked) => {
        if (!module.multi) return onChange(option);
        const rest = (selected as string[]).filter((v) => v !== option);
        onChange(checked ? [...rest, option] : rest);
      }}
    />
  );
}

function YesNoModule({
  module,
  value,
  onChange,
}: ModuleRendererProps & { module: Extract<Answerable, { type: 'yes_no' }> }) {
  const current = value === true ? 'yes' : value === false ? 'no' : '';
  return (
    <ChoiceCards
      name={moduleDomId(module.id)}
      legend={module.label}
      hideLegend
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
      value={current}
      onChange={(option) => onChange(option === 'yes')}
      columns={2}
    />
  );
}

function control(props: ModuleRendererProps & { module: Answerable }): React.ReactNode {
  const { module, value, onChange, uploads } = props;
  const id = moduleDomId(module.id);
  switch (module.type) {
    case 'short_text':
      return (
        <input
          id={id}
          type="text"
          value={textOf(value)}
          placeholder={module.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      );
    case 'long_text':
      return (
        <textarea
          id={id}
          rows={5}
          value={textOf(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      );
    case 'date':
      return (
        <input
          id={id}
          type="date"
          max="2099-12-31"
          value={textOf(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} tabular sm:max-w-[18rem]`}
        />
      );
    case 'money_range':
      return (
        <select
          id={id}
          value={textOf(value)}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Choose a range</option>
          {VALUE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'upload':
      return (
        <UploadSlot
          slot={module.id}
          label={module.label}
          multiple={module.multiple}
          uploads={uploads}
          headingHidden
        />
      );
    case 'choice':
      return <ChoiceModule {...props} module={module} />;
    case 'yes_no':
      return <YesNoModule {...props} module={module} />;
  }
}

/** Renders one follow-up module of any type (#seam:rothrock-intake-modules). */
export function ModuleRenderer(props: ModuleRendererProps) {
  const { module } = props;
  if (module.type === 'info') {
    return (
      <div className="border border-line border-t-4 border-t-brass-400 bg-white p-5">
        <h3 className="font-sans text-h4 text-ink">{module.title}</h3>
        <p className="mt-2 text-body text-ink-2">{module.body}</p>
      </div>
    );
  }
  return (
    <ModuleShell module={module} value={props.value} onChange={props.onChange}>
      {control({ ...props, module })}
    </ModuleShell>
  );
}
