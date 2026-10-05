'use client';

import {
  HEARD_ABOUT_OPTIONS,
  takesHeardAboutDetail,
  type HeardAbout,
} from '@/lib/intake/contract';
import { HEARD_ABOUT_COPY, HEARD_ABOUT_DETAIL_LABELS, HEARD_ABOUT_LABELS } from '@/lib/intake/copy';
import { ChoiceCards } from './ChoiceCards';
import { Field, TextInput } from './FormFields';

const CHOICES = HEARD_ABOUT_OPTIONS.map((value) => ({ value, label: HEARD_ABOUT_LABELS[value] }));

export const HEARD_ABOUT_DETAIL_ID = 'heard-about-detail';

/** What the question writes back: the choice, and the detail only while the choice takes one. */
export interface HeardAboutPatch {
  heardAbout?: HeardAbout;
  heardAboutDetail?: string;
}

interface HeardAboutProps {
  value: HeardAbout | undefined;
  detail: string | undefined;
  onChange(patch: HeardAboutPatch): void;
}

/**
 * "How did you hear about us?" (Arthur, 2026-10-05): one choice, then a short
 * optional box for the site or the person when the choice calls for one. A
 * choice that takes no detail drops the detail typed under an earlier one.
 */
export function HeardAboutFields({ value, detail, onChange }: HeardAboutProps) {
  const detailFor = value && takesHeardAboutDetail(value) ? value : null;
  return (
    <div className="space-y-4">
      <ChoiceCards
        name="heard-about"
        legend={HEARD_ABOUT_COPY.legend}
        options={CHOICES}
        value={value ?? ''}
        onChange={(heardAbout) =>
          onChange({
            heardAbout,
            heardAboutDetail: takesHeardAboutDetail(heardAbout) ? detail : undefined,
          })
        }
        columns={2}
      />
      {detailFor && (
        <Field id={HEARD_ABOUT_DETAIL_ID} label={HEARD_ABOUT_DETAIL_LABELS[detailFor]} optional>
          <TextInput
            id={HEARD_ABOUT_DETAIL_ID}
            value={detail ?? ''}
            onChange={(text) => onChange({ heardAboutDetail: text || undefined })}
            maxLength={200}
            className="sm:max-w-[24rem]"
          />
        </Field>
      )}
    </div>
  );
}
