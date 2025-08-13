import { describe, it, expect } from 'vitest';
import { calculateMonthRange } from '@/lib/services/monthService';

describe('date utils', () => {
    it('calculateMonthRange gives inclusive start and exclusive end', () => {
        const { startDate, endDate } = calculateMonthRange(new Date('2025-08-15T12:00:00Z'));
        expect(startDate.toISOString()).toBe('2025-08-01T00:00:00.000Z');
        expect(endDate.toISOString()).toBe('2025-09-01T00:00:00.000Z');
    });
});
