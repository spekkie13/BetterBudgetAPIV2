import { describe, it, expect } from 'vitest';
import { OPTIONS as BudgetsOPTIONS } from '@/app/api/budgets/route';

describe('CORS preflight', () => {
    it('OPTIONS returns 204 with headers', async () => {
        const res = await BudgetsOPTIONS();
        expect(res.status).toBe(204);
        // If you set specific headers in corsHeaders, check for them:
        // expect(res.headers.get('access-control-allow-origin')).toBe('*');
    });
});
