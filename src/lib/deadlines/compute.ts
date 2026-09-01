/**
 * `computeDeadlines(answers, today)` – pure. Walks the rule table, runs every
 * clock that has started, applies the CCP § 12a weekend / holiday roll, and
 * returns results sorted soonest first (clocks that have not started last).
 */
import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  formatLongDate,
  formatShortDate,
  isValidISODate,
  isWeekend,
  rollToCourtDay,
} from './dates';
import { DEADLINE_RULES } from './rules';
import type {
  Clock,
  DeadlineResult,
  DeadlineRule,
  DeadlineStatus,
  Period,
  WizardAnswers,
} from './types';

/** Fewer than this many days left is "urgent". */
export const URGENT_DAYS = 30;

interface ClockOutcome {
  clock: Clock;
  start: string;
  /** Deadline before the weekend / holiday roll. */
  raw: string;
  /** Deadline after the roll. */
  deadline: string;
  rolled: boolean;
}

export function addPeriod(isoDate: string, period: Period): string {
  if (period.days !== undefined) return addDays(isoDate, period.days);
  if (period.months !== undefined) return addMonths(isoDate, period.months);
  if (period.years !== undefined) return addYears(isoDate, period.years);
  throw new RangeError(`Period "${period.label}" has no days, months, or years`);
}

function runClock(clock: Clock, answers: WizardAnswers): ClockOutcome | null {
  const start = clock.start(answers);
  if (!start) return null;
  const raw = addPeriod(start, clock.period);
  const { date, rolled } = rollToCourtDay(raw);
  return { clock, start, raw, deadline: date, rolled };
}

export function statusFor(daysRemaining: number): DeadlineStatus {
  if (daysRemaining < 0) return 'passed';
  if (daysRemaining < URGENT_DAYS) return 'urgent';
  return 'open';
}

function describeClock(outcome: ClockOutcome): string {
  const { clock, start, raw, deadline, rolled } = outcome;
  const base =
    `${capitalize(clock.period.label)} from ${clock.from} (${formatShortDate(start)}) ` +
    `is ${formatShortDate(raw)}.`;
  if (!rolled) return base;
  const reason = isWeekend(raw) ? 'a weekend' : 'a court holiday';
  return (
    `${base} That falls on ${reason}, so the law moves it to the next court day, ` +
    `${formatLongDate(deadline)}. To be safe, act before the earlier date.`
  );
}

function explain(outcomes: ClockOutcome[], winner: ClockOutcome): string {
  const parts = outcomes.map(describeClock);
  if (outcomes.length === 1) {
    return `${parts[0]} So the estimated deadline is ${formatLongDate(winner.deadline)}.`;
  }
  return (
    `${parts.join(' ')} The law gives you the later of these dates, so the estimated deadline ` +
    `is ${formatLongDate(winner.deadline)}.`
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function evaluateRule(rule: DeadlineRule, answers: WizardAnswers, today: string): DeadlineResult {
  const shared = {
    id: rule.id,
    label: rule.label,
    statute: rule.statute,
    statuteUrl: rule.statuteUrl,
    description: rule.description,
    whyItMatters: rule.whyItMatters,
    caveats: rule.caveats(answers),
  };
  const outcomes = rule.clocks
    .map((clock) => runClock(clock, answers))
    .filter((o): o is ClockOutcome => o !== null);
  if (outcomes.length === 0) {
    return {
      ...shared,
      deadline: null,
      daysRemaining: null,
      status: 'not-started',
      explanation: rule.notStarted(answers),
    };
  }
  const winner = outcomes.reduce((best, o) => (o.deadline > best.deadline ? o : best));
  const daysRemaining = daysBetween(today, winner.deadline);
  return {
    ...shared,
    deadline: winner.deadline,
    daysRemaining,
    status: statusFor(daysRemaining),
    explanation: explain(outcomes, winner),
  };
}

/** Soonest first; results without a date keep table order at the end. */
export function sortResults(results: readonly DeadlineResult[]): DeadlineResult[] {
  const indexed = results.map((result, index) => ({ result, index }));
  indexed.sort((a, b) => {
    const da = a.result.deadline;
    const db = b.result.deadline;
    if (da === null && db === null) return a.index - b.index;
    if (da === null) return 1;
    if (db === null) return -1;
    return da < db ? -1 : da > db ? 1 : a.index - b.index;
  });
  return indexed.map((entry) => entry.result);
}

export function computeDeadlines(answers: WizardAnswers, today: string): DeadlineResult[] {
  if (!isValidISODate(today)) throw new RangeError(`Invalid "today" date: "${today}"`);
  const results = DEADLINE_RULES.filter((rule) => rule.applies(answers)).map((rule) =>
    evaluateRule(rule, answers, today),
  );
  return sortResults(results);
}

export function hasUrgentOrPassed(results: readonly DeadlineResult[]): boolean {
  return results.some((r) => r.status === 'urgent' || r.status === 'passed');
}
