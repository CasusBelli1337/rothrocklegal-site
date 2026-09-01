import { describe, expect, it } from 'vitest';
import { DEADLINE_RULES } from './rules';
import type { DeadlineId, WizardAnswers } from './types';

const rule = (id: DeadlineId) => {
  const found = DEADLINE_RULES.find((r) => r.id === id);
  if (!found) throw new Error(`missing rule ${id}`);
  return found;
};

const BANNED = [
  '—',
  'leverage',
  'harness',
  'navigate',
  'unlock',
  'transform',
  'journey',
  'seamless',
  'cutting-edge',
  "it's important to note",
  'expert',
  'specialist',
];

const SAMPLE_ANSWERS: WizardAnswers[] = [
  {},
  { instrument: 'not-sure', noticeServed: 'no', probateStatus: 'not-sure' },
  {
    instrument: 'both',
    noticeServed: 'yes',
    trustCopy: 'not-asked',
    probateStatus: 'filed',
  },
  {
    instrument: 'trust',
    noticeServed: 'not-sure',
    trustCopy: 'asked-not-received',
  },
  { instrument: 'will', probateStatus: 'not-filed', accounting: 'received' },
  { instrument: 'will', probateStatus: 'admitted', accounting: 'not-received' },
  {
    instrument: 'trust',
    noticeServed: 'yes',
    noticeDate: '2026-01-01',
    trustCopy: 'received',
    trustCopyDate: '2026-06-01',
  },
];

describe('rule table integrity', () => {
  it('has unique ids and complete copy', () => {
    const ids = DEADLINE_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of DEADLINE_RULES) {
      expect(r.label.length).toBeGreaterThan(0);
      expect(r.statute).toMatch(/§ \d/);
      expect(r.statuteUrl).toMatch(
        /^https:\/\/leginfo\.legislature\.ca\.gov\/.*sectionNum=[\d.a-z]+\.$/,
      );
      expect(r.description.length).toBeGreaterThan(40);
      expect(r.whyItMatters.length).toBeGreaterThan(20);
      expect(r.clocks.length).toBeGreaterThan(0);
    }
  });

  it('gives every clock exactly one period unit', () => {
    for (const r of DEADLINE_RULES) {
      for (const clock of r.clocks) {
        const units = [clock.period.days, clock.period.months, clock.period.years].filter(
          (u) => u !== undefined,
        );
        expect(units).toHaveLength(1);
        expect(clock.period.label.length).toBeGreaterThan(0);
        expect(clock.from.length).toBeGreaterThan(0);
      }
    }
  });

  it('uses no em dashes or banned words anywhere in the copy', () => {
    const texts: string[] = [];
    for (const r of DEADLINE_RULES) {
      texts.push(r.label, r.description, r.whyItMatters);
      for (const answers of SAMPLE_ANSWERS) {
        texts.push(r.notStarted(answers), ...r.caveats(answers));
      }
    }
    for (const text of texts) {
      for (const word of BANNED) {
        expect(text.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('never tells the visitor they have unlimited time', () => {
    for (const r of DEADLINE_RULES) {
      for (const answers of SAMPLE_ANSWERS) {
        expect(r.notStarted(answers)).not.toMatch(/(?<!does not mean )you have unlimited time/i);
        expect(r.notStarted(answers)).not.toMatch(/no deadline/i);
      }
    }
  });
});

describe('applies()', () => {
  it('trust contest applies whenever a trust may exist', () => {
    const r = rule('trust-contest');
    expect(r.applies({ instrument: 'trust' })).toBe(true);
    expect(r.applies({ instrument: 'both' })).toBe(true);
    expect(r.applies({ instrument: 'not-sure' })).toBe(true);
    expect(r.applies({ instrument: 'will' })).toBe(false);
    expect(r.applies({})).toBe(false);
  });

  it('will contest applies whenever a will may exist', () => {
    const r = rule('will-contest');
    expect(r.applies({ instrument: 'will' })).toBe(true);
    expect(r.applies({ instrument: 'both' })).toBe(true);
    expect(r.applies({ instrument: 'not-sure' })).toBe(true);
    expect(r.applies({ instrument: 'trust' })).toBe(false);
  });

  it('concern-driven rules apply only to their concern', () => {
    const all: WizardAnswers = {
      concerns: ['elder-abuse', 'broken-promise', 'trustee-accounting', 'owed-money'],
    };
    expect(rule('elder-abuse').applies(all)).toBe(true);
    expect(rule('broken-promise').applies(all)).toBe(true);
    expect(rule('breach-of-trust').applies(all)).toBe(true);
    expect(rule('claims-against-decedent').applies(all)).toBe(true);
    expect(rule('creditor-claim').applies(all)).toBe(true);
    const none: WizardAnswers = { instrument: 'both', concerns: [] };
    for (const id of [
      'elder-abuse',
      'broken-promise',
      'breach-of-trust',
      'creditor-claim',
    ] as const) {
      expect(rule(id).applies(none)).toBe(false);
    }
    expect(rule('claims-against-decedent').applies({ concerns: ['owed-money'] })).toBe(true);
    expect(rule('claims-against-decedent').applies({ concerns: ['elder-abuse'] })).toBe(false);
  });
});

describe('§ 16061.8 clocks', () => {
  const [notice120, copy60] = rule('trust-contest').clocks;
  const base: WizardAnswers = {
    instrument: 'trust',
    noticeServed: 'yes',
    noticeDate: '2026-01-01',
    trustCopy: 'received',
  };

  it('starts the 120-day clock only on a served notice with a date', () => {
    expect(notice120.start(base)).toBe('2026-01-01');
    expect(notice120.start({ ...base, noticeServed: 'no' })).toBeUndefined();
    expect(notice120.start({ ...base, noticeServed: 'not-sure' })).toBeUndefined();
    expect(notice120.start({ ...base, noticeDate: undefined })).toBeUndefined();
    expect(notice120.start({ ...base, noticeDate: '2026-02-30' })).toBeUndefined();
  });

  it('starts the 60-day clock only for a copy delivered inside the 120-day window', () => {
    expect(copy60.start({ ...base, trustCopyDate: '2026-01-01' })).toBe('2026-01-01');
    expect(copy60.start({ ...base, trustCopyDate: '2026-05-01' })).toBe('2026-05-01'); // day 120
    expect(copy60.start({ ...base, trustCopyDate: '2026-05-02' })).toBeUndefined(); // day 121
    expect(copy60.start({ ...base, trustCopyDate: '2025-12-31' })).toBeUndefined(); // before notice
    expect(
      copy60.start({
        ...base,
        trustCopy: 'not-asked',
        trustCopyDate: '2026-03-01',
      }),
    ).toBeUndefined();
    expect(
      copy60.start({
        ...base,
        noticeServed: 'no',
        trustCopyDate: '2026-03-01',
      }),
    ).toBeUndefined();
  });

  it('explains a no-notice answer without promising unlimited time', () => {
    const text = rule('trust-contest').notStarted({
      instrument: 'trust',
      noticeServed: 'no',
    });
    expect(text).toContain('has not started');
    expect(text).toContain('laches');
    expect(text).toContain('does not mean you have unlimited time');
  });

  it('treats an unknown notice as possibly running', () => {
    const text = rule('trust-contest').notStarted({
      instrument: 'trust',
      noticeServed: 'not-sure',
    });
    expect(text).toContain('may already be running');
    expect(text).toContain('urgent');
  });

  it('flags a copy delivered outside the window in the caveats', () => {
    const caveats = rule('trust-contest').caveats({
      ...base,
      trustCopyDate: '2026-08-01',
    });
    expect(caveats.join(' ')).toContain('outside the 120-day window');
  });
});

describe('other clocks', () => {
  it('will contest counts from the admission order only', () => {
    const [clock] = rule('will-contest').clocks;
    expect(clock.period.days).toBe(120);
    expect(clock.start({ probateStatus: 'admitted', probateDate: '2026-04-24' })).toBe(
      '2026-04-24',
    );
    expect(clock.start({ probateStatus: 'filed', probateDate: '2026-04-24' })).toBeUndefined();
    expect(rule('will-contest').notStarted({ probateStatus: 'filed' })).toContain('§ 8250');
    expect(rule('will-contest').notStarted({ probateStatus: 'not-filed' })).toContain(
      'has not started',
    );
  });

  it('breach of trust uses the accounting clock or the discovery clock, never both', () => {
    const [account, discovery] = rule('breach-of-trust').clocks;
    const received: WizardAnswers = {
      accounting: 'received',
      accountingDate: '2026-01-15',
      breachDiscoveryDate: '2025-06-01',
    };
    expect(account.start(received)).toBe('2026-01-15');
    expect(discovery.start(received)).toBeUndefined();
    const none: WizardAnswers = {
      accounting: 'not-received',
      breachDiscoveryDate: '2025-06-01',
    };
    expect(account.start(none)).toBeUndefined();
    expect(discovery.start(none)).toBe('2025-06-01');
  });

  it("creditor's claim runs four months from letters and 60 days from notice", () => {
    const [letters, notice] = rule('creditor-claim').clocks;
    expect(letters.period.months).toBe(4);
    expect(notice.period.days).toBe(60);
  });

  it('death-based rules run one year and elder abuse four years from discovery', () => {
    expect(rule('broken-promise').clocks[0].period.years).toBe(1);
    expect(rule('claims-against-decedent').clocks[0].period.years).toBe(1);
    expect(rule('elder-abuse').clocks[0].period.years).toBe(4);
  });
});
