/** Helpers shared by the rule files. */
import { isValidISODate } from './dates';
import type { Concern, WizardAnswers } from './types';

const LEGINFO = 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml';

/** leginfo wants the trailing dot after the section number. */
export const statuteUrl = (code: string, section: string): string =>
  `${LEGINFO}?lawCode=${code}&sectionNum=${section}.`;

export const validDate = (value: string | undefined): string | undefined =>
  isValidISODate(value) ? value : undefined;

export const hasConcern = (answers: WizardAnswers, concern: Concern): boolean =>
  answers.concerns?.includes(concern) ?? false;

export const ONE_YEAR = { years: 1, label: 'one year' } as const;
export const THREE_YEARS = { years: 3, label: 'three years' } as const;
export const FOUR_YEARS = { years: 4, label: 'four years' } as const;
export const SIXTY_DAYS = { days: 60, label: '60 days' } as const;
export const ONE_TWENTY_DAYS = { days: 120, label: '120 days' } as const;
export const FOUR_MONTHS = { months: 4, label: 'four months' } as const;
