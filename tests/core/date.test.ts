import { describe, it, expect } from 'vitest';
import { monthToDate } from '@/core/date';

describe('monthToDate', () => {
  it('appends -01 to a YYYY-MM string', () => {
    expect(monthToDate('2024-03')).toBe('2024-03-01');
  });

  it('handles January correctly', () => {
    expect(monthToDate('2024-01')).toBe('2024-01-01');
  });

  it('handles December correctly', () => {
    expect(monthToDate('2024-12')).toBe('2024-12-01');
  });

  it('converts a Date object to YYYY-MM-01 (UTC)', () => {
    const date = new Date('2024-03-15T00:00:00Z');
    expect(monthToDate(date)).toBe('2024-03-01');
  });

  it('pads single-digit months when converting from Date', () => {
    const date = new Date('2024-06-01T00:00:00Z');
    expect(monthToDate(date)).toBe('2024-06-01');
  });

  it('returns the same value when given a YYYY-MM-01 string', () => {
    expect(monthToDate('2024-03-01')).toBe('2024-03-01');
  });
});
