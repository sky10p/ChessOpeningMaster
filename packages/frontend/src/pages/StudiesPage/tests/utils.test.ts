import { parseManualTime, formatDuration } from '../utils';

describe('parseManualTime', () => {
  it('returns null for empty input', () => {
    expect(parseManualTime('')).toBeNull();
    expect(parseManualTime('   ')).toBeNull();
  });

  it('parses hours only', () => {
    expect(parseManualTime('2h')).toBe(7200);
    expect(parseManualTime('3')).toBe(10800);
  });

  it('parses minutes only', () => {
    expect(parseManualTime('30m')).toBe(1800);
    expect(parseManualTime('45min')).toBe(2700);
  });

  it('parses hours and minutes', () => {
    expect(parseManualTime('1h 30m')).toBe(5400);
    expect(parseManualTime('2:15')).toBe(8100);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(parseManualTime(' 4H ')).toBe(14400);
    expect(parseManualTime('5 Min')).toBe(300);
  });

  it('returns null for invalid strings', () => {
    expect(parseManualTime('abc')).toBeNull();
    expect(parseManualTime('1x')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formats seconds less than a minute', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(75)).toBe('1m 15s');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3661)).toBe('1h 1m 1s');
  });

  it('omits zero values appropriately', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(0)).toBe('0s');
  });
});