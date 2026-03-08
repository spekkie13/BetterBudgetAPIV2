import { describe, it, expect } from 'vitest';
import { isValueNull } from '@/core/http/requestHelpers';

describe('isValueNull', () => {
  it('returns true for null', () => {
    expect(isValueNull(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isValueNull(undefined)).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isValueNull(0)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValueNull('')).toBe(false);
  });

  it('returns false for false', () => {
    expect(isValueNull(false)).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isValueNull(42)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isValueNull('hello')).toBe(false);
  });

  it('returns false for an object', () => {
    expect(isValueNull({})).toBe(false);
  });
});
