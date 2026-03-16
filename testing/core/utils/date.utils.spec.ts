import { formatDate, relativeDate } from '../../../src/app/core/utils/date.utils';

/** Returns an ISO string that is `offsetMs` milliseconds from now */
function msAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

describe('formatDate()', () => {
  it('should return a non-empty string', () => {
    expect(formatDate('2026-03-05T14:30:00.000Z').length).toBeGreaterThan(0);
  });

  it('should include the year', () => {
    expect(formatDate('2026-03-05T14:30:00.000Z')).toContain('2026');
  });

  it('should include the day number', () => {
    // Use noon UTC so the date does not shift across midnight in common timezones
    const result = formatDate('2026-03-05T12:00:00.000Z');
    expect(result).toMatch(/5/);
  });
});

describe('relativeDate()', () => {
  it('should return "Ahora" for a date less than 1 minute ago', () => {
    expect(relativeDate(msAgo(30_000))).toBe('Ahora');
  });

  it('should return "hace X min" for dates between 1–59 minutes ago', () => {
    expect(relativeDate(msAgo(3 * MINUTE))).toBe('hace 3 min');
    expect(relativeDate(msAgo(59 * MINUTE))).toBe('hace 59 min');
  });

  it('should return "hace X h" for dates between 1–23 hours ago', () => {
    expect(relativeDate(msAgo(2 * HOUR))).toBe('hace 2 h');
    expect(relativeDate(msAgo(23 * HOUR))).toBe('hace 23 h');
  });

  it('should return "hace 1 día" (singular) for exactly 1 day ago', () => {
    expect(relativeDate(msAgo(DAY + MINUTE))).toBe('hace 1 día');
  });

  it('should return "hace X días" (plural) for 2–6 days ago', () => {
    expect(relativeDate(msAgo(3 * DAY + MINUTE))).toBe('hace 3 días');
    expect(relativeDate(msAgo(6 * DAY + MINUTE))).toBe('hace 6 días');
  });

  it('should return "hace 1 semana" (singular) for exactly 1 week ago', () => {
    expect(relativeDate(msAgo(WEEK + MINUTE))).toBe('hace 1 semana');
  });

  it('should return "hace X semanas" (plural) for 2–4 weeks ago', () => {
    expect(relativeDate(msAgo(2 * WEEK + MINUTE))).toBe('hace 2 semanas');
    expect(relativeDate(msAgo(4 * WEEK + MINUTE))).toBe('hace 4 semanas');
  });

  it('should fall back to formatDate() for dates older than ~5 weeks', () => {
    const old = '2024-01-01T00:00:00.000Z';
    expect(relativeDate(old)).toBe(formatDate(old));
  });
});
