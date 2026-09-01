import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { computeDeadlines, hasUrgentOrPassed, sortResults, statusFor } from './compute';
import type { DeadlineId, DeadlineResult, WizardAnswers } from './types';

const TODAY = '2026-09-01'; // a Tuesday

const byId = (results: DeadlineResult[], id: DeadlineId): DeadlineResult => {
  const found = results.find((r) => r.id === id);
  if (!found) throw new Error(`no result ${id}`);
  return found;
};

describe('computeDeadlines – trust contest (§ 16061.8)', () => {
  it('lets the 60-day copy clock control when it is later', () => {
    const answers: WizardAnswers = {
      deathDate: '2026-05-01',
      instrument: 'trust',
      noticeServed: 'yes',
      noticeDate: addDays(TODAY, -100), // 2026-05-24
      trustCopy: 'received',
      trustCopyDate: addDays(TODAY, -10), // 2026-08-22
    };
    const [result] = computeDeadlines(answers, TODAY);
    expect(result.id).toBe('trust-contest');
    expect(result.deadline).toBe('2026-10-21');
    expect(result.daysRemaining).toBe(50);
    expect(result.status).toBe('open');
    expect(result.explanation).toContain('120 days from the day the trustee');
    expect(result.explanation).toContain('is September 21, 2026');
    expect(result.explanation).toContain('60 days from the day the trust copy');
    expect(result.explanation).toContain('later of these dates');
    expect(result.explanation).toContain('Wednesday, October 21, 2026');
  });

  it('lets the 120-day clock control when the copy came with the notice', () => {
    const answers: WizardAnswers = {
      instrument: 'trust',
      noticeServed: 'yes',
      noticeDate: '2026-06-01',
      trustCopy: 'received',
      trustCopyDate: '2026-06-01',
    };
    const [result] = computeDeadlines(answers, TODAY);
    expect(result.deadline).toBe('2026-09-29'); // June 1 + 120 (a Tuesday)
    expect(result.daysRemaining).toBe(28);
    expect(result.status).toBe('urgent');
  });

  it('ignores a copy delivered after the window and marks the contest passed', () => {
    const answers: WizardAnswers = {
      instrument: 'trust',
      noticeServed: 'yes',
      noticeDate: addDays(TODAY, -200), // 2026-02-13
      trustCopy: 'received',
      trustCopyDate: addDays(TODAY, -10),
    };
    const [result] = computeDeadlines(answers, TODAY);
    expect(result.deadline).toBe('2026-06-15'); // Feb 13 + 120 = June 13 (Sat) → Mon June 15
    expect(result.status).toBe('passed');
    expect(result.daysRemaining).toBe(-78);
    expect(result.explanation).not.toContain('later of');
    expect(result.explanation).toContain('weekend');
    expect(result.caveats.join(' ')).toContain('outside the 120-day window');
  });

  it('reports no clock when no notice was served, and never says unlimited', () => {
    const [result] = computeDeadlines({ instrument: 'trust', noticeServed: 'no' }, TODAY);
    expect(result.status).toBe('not-started');
    expect(result.deadline).toBeNull();
    expect(result.daysRemaining).toBeNull();
    expect(result.explanation).toContain('laches');
    expect(result.explanation).not.toMatch(/(?<!does not mean )you have unlimited time/);
  });

  it('treats a "not sure" notice as possibly running', () => {
    const [result] = computeDeadlines({ instrument: 'trust', noticeServed: 'not-sure' }, TODAY);
    expect(result.status).toBe('not-started');
    expect(result.explanation).toContain('may already be running');
  });

  it('asks for the missing date rather than guessing', () => {
    const [result] = computeDeadlines({ instrument: 'trust', noticeServed: 'yes' }, TODAY);
    expect(result.status).toBe('not-started');
    expect(result.explanation).toContain('Tell us the date');
    const [bad] = computeDeadlines(
      { instrument: 'trust', noticeServed: 'yes', noticeDate: '2026-02-31' },
      TODAY,
    );
    expect(bad.status).toBe('not-started');
  });
});

describe('computeDeadlines – will contest (§ 8270)', () => {
  it('marks a will admitted 130 days ago as passed, after the weekend roll', () => {
    const answers: WizardAnswers = {
      instrument: 'will',
      probateStatus: 'admitted',
      probateDate: addDays(TODAY, -130), // 2026-04-24
    };
    const [result] = computeDeadlines(answers, TODAY);
    expect(result.id).toBe('will-contest');
    expect(result.deadline).toBe('2026-08-24'); // Aug 22 is a Saturday
    expect(result.status).toBe('passed');
    expect(result.daysRemaining).toBe(-8);
    expect(result.explanation).toContain('August 22, 2026');
    expect(result.explanation).toContain('Monday, August 24, 2026');
  });

  it('explains pending, unfiled, and unknown probate without a date', () => {
    for (const probateStatus of ['filed', 'not-filed', 'not-sure'] as const) {
      const [result] = computeDeadlines({ instrument: 'will', probateStatus }, TODAY);
      expect(result.status).toBe('not-started');
      expect(result.deadline).toBeNull();
    }
    const [pending] = computeDeadlines({ instrument: 'will', probateStatus: 'filed' }, TODAY);
    expect(pending.explanation).toContain('before the hearing');
  });

  it('shows both contests when the visitor is not sure what exists', () => {
    const results = computeDeadlines({ instrument: 'not-sure' }, TODAY);
    expect(results.map((r) => r.id)).toEqual(['trust-contest', 'will-contest']);
    expect(results[0].explanation.startsWith('If there is a trust:')).toBe(true);
    expect(results[1].explanation.startsWith('If there is a will:')).toBe(true);
  });
});

describe('status boundaries', () => {
  const willAdmittedFor = (deadline: string): WizardAnswers => ({
    instrument: 'will',
    probateStatus: 'admitted',
    probateDate: addDays(deadline, -120),
  });

  it('is urgent under 30 days, open at 30, passed once negative', () => {
    expect(
      byId(computeDeadlines(willAdmittedFor(addDays(TODAY, 29)), TODAY), 'will-contest').status,
    ).toBe('urgent');
    expect(
      byId(computeDeadlines(willAdmittedFor(addDays(TODAY, 30)), TODAY), 'will-contest').status,
    ).toBe('open');
    expect(byId(computeDeadlines(willAdmittedFor(TODAY), TODAY), 'will-contest').status).toBe(
      'urgent',
    );
    expect(
      byId(computeDeadlines(willAdmittedFor(addDays(TODAY, -1)), TODAY), 'will-contest').status,
    ).toBe('passed');
  });

  it('exposes the same thresholds through statusFor', () => {
    expect(statusFor(0)).toBe('urgent');
    expect(statusFor(29)).toBe('urgent');
    expect(statusFor(30)).toBe('open');
    expect(statusFor(-1)).toBe('passed');
  });
});

describe('computeDeadlines – date-of-death and other rules', () => {
  it('runs one year from death for promises and claims, leap day included', () => {
    const answers: WizardAnswers = {
      deathDate: '2028-02-29',
      instrument: 'trust',
      noticeServed: 'no',
      concerns: ['broken-promise', 'owed-money'],
    };
    const results = computeDeadlines(answers, '2028-03-01');
    expect(byId(results, 'broken-promise').deadline).toBe('2029-02-28');
    expect(byId(results, 'claims-against-decedent').deadline).toBe('2029-02-28');
    expect(byId(results, 'creditor-claim').status).toBe('not-started');
    expect(byId(results, 'creditor-claim').explanation).toContain('one-year limit');
  });

  it('runs four years from discovery for elder abuse, rolling over a generated holiday', () => {
    const answers: WizardAnswers = {
      concerns: ['elder-abuse'],
      abuseDiscoveryDate: '2026-09-01',
    };
    const [result] = computeDeadlines(answers, TODAY);
    // 2030-09-01 is a Sunday; 2030-09-02 is Labor Day.
    expect(result.deadline).toBe('2030-09-03');
    expect(result.explanation).toContain('weekend'); // Sunday, then Labor Day
    expect(result.status).toBe('open');
  });

  it("takes the later of letters + 4 months and notice + 60 days for a creditor's claim", () => {
    const answers: WizardAnswers = {
      concerns: ['owed-money'],
      deathDate: '2026-01-10',
      lettersDate: '2026-05-31',
      noticeOfAdministrationDate: '2026-08-10',
    };
    const result = byId(computeDeadlines(answers, TODAY), 'creditor-claim');
    expect(result.deadline).toBe('2026-10-09'); // Aug 10 + 60 beats Sept 30
    expect(result.explanation).toContain('Four months from the day the court issued letters');
    const lettersOnly = byId(
      computeDeadlines({ concerns: ['owed-money'], lettersDate: '2026-01-31' }, TODAY),
      'creditor-claim',
    );
    expect(lettersOnly.deadline).toBe('2026-06-01'); // May 31 is a Sunday
  });

  it('runs three years from an accounting, rolling over MLK Day 2029', () => {
    const answers: WizardAnswers = {
      concerns: ['trustee-accounting'],
      accounting: 'received',
      accountingDate: '2026-01-15',
    };
    const [result] = computeDeadlines(answers, TODAY);
    expect(result.deadline).toBe('2029-01-16');
    expect(result.caveats.join(' ')).toContain('fairly disclosed');
    const [discovery] = computeDeadlines(
      {
        concerns: ['trustee-accounting'],
        accounting: 'not-received',
        breachDiscoveryDate: '2025-03-03',
      },
      TODAY,
    );
    expect(discovery.deadline).toBe('2028-03-03');
  });
});

describe('ordering, empties, and guards', () => {
  it('returns nothing when nothing applies', () => {
    expect(computeDeadlines({}, TODAY)).toEqual([]);
    expect(computeDeadlines({ deathDate: '2026-01-01', concerns: [] }, TODAY)).toEqual([]);
  });

  it('sorts passed first, then soonest, with unstarted clocks last', () => {
    const answers: WizardAnswers = {
      deathDate: '2026-01-10',
      instrument: 'both',
      noticeServed: 'not-sure',
      probateStatus: 'admitted',
      probateDate: addDays(TODAY, -130),
      concerns: ['broken-promise', 'elder-abuse'],
      abuseDiscoveryDate: '2025-01-01',
    };
    const ids = computeDeadlines(answers, TODAY).map((r) => r.id);
    expect(ids).toEqual(['will-contest', 'broken-promise', 'elder-abuse', 'trust-contest']);
  });

  it('keeps table order among equal dates and unstarted clocks', () => {
    const make = (id: DeadlineId, deadline: string | null): DeadlineResult => ({
      id,
      label: id,
      statute: '',
      statuteUrl: '',
      description: '',
      whyItMatters: '',
      deadline,
      daysRemaining: null,
      status: deadline ? 'open' : 'not-started',
      explanation: '',
      caveats: [],
    });
    const sorted = sortResults([
      make('elder-abuse', null),
      make('will-contest', '2026-10-01'),
      make('trust-contest', '2026-10-01'),
      make('broken-promise', null),
    ]);
    expect(sorted.map((r) => r.id)).toEqual([
      'will-contest',
      'trust-contest',
      'elder-abuse',
      'broken-promise',
    ]);
  });

  it('throws on an invalid today rather than computing garbage', () => {
    expect(() => computeDeadlines({ instrument: 'trust' }, '2026-13-01')).toThrow(RangeError);
  });

  it('flags urgent or passed results for the call-now button', () => {
    const calm = computeDeadlines(
      { instrument: 'trust', noticeServed: 'yes', noticeDate: TODAY },
      TODAY,
    );
    expect(hasUrgentOrPassed(calm)).toBe(false);
    const late = computeDeadlines(
      {
        instrument: 'will',
        probateStatus: 'admitted',
        probateDate: addDays(TODAY, -130),
      },
      TODAY,
    );
    expect(hasUrgentOrPassed(late)).toBe(true);
  });
});
