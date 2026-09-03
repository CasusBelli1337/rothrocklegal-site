/** One plain phrase for where a deadline stands, shown on each result card. */
import type { DeadlineResult } from './types';

export function describeStatus(result: DeadlineResult): string {
  const days = result.daysRemaining;
  switch (result.status) {
    case 'not-started':
      return 'clock not started';
    case 'passed':
      return days === -1 ? 'passed yesterday' : `passed ${Math.abs(days ?? 0)} days ago`;
    case 'urgent':
      return days === 0
        ? 'TODAY'
        : days === 1
          ? '1 day left (urgent)'
          : `${days} days left (urgent)`;
    default:
      return `${days} days left`;
  }
}
