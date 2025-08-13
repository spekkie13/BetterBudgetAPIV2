import { calculateMonthRange, getBudgetMonthByStartDate } from '@/lib/services/monthService';
import { seedTeamUser, seedCategory, seedBudget } from '../utils/fixtures';

describe('monthService', () => {
    it('calculateMonthRange returns start and exclusive end of month', () => {
        const { startDate, endDate } = calculateMonthRange(new Date('2025-08-15T12:34:00Z'));
        expect(startDate.toISOString().startsWith('2025-08-01')).toBe(true);
        expect(endDate.toISOString().startsWith('2025-09-01')).toBe(true);
    });

    it('getBudgetMonthByStartDate finds exact month if budget exists', async () => {
        const { teamId } = await seedTeamUser();
        const cat = await seedCategory(teamId);
        await seedBudget(teamId, cat.id, '2025-08', 10000);
        const found = await getBudgetMonthByStartDate(teamId, '2025-08-01');
        expect(typeof found).toBe('string'); // schema stores DATE (ISO yyyy-mm-dd)
        expect(found).toBe('2025-08-01');
    });
});
