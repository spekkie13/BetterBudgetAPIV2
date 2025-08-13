import { db } from '@/lib/db/client';
import {
    teams, users, memberships, accounts, categories, budgets,
} from '@/lib/db/schema';

// --- tiny helpers to normalize drizzle builder vs execute outputs ---
function toRows<T>(res: T[] | { rows: T[] }): T[] {
    return Array.isArray(res) ? res : res.rows;
}
async function returningOne<T>(p: Promise<T[] | { rows: T[] }>): Promise<T> {
    const rows = toRows(await p);
    return rows[0]!;
}

// Normalize "YYYY-MM" -> "YYYY-MM-01"
const toMonthStart = (mm: string) => `${mm}-01`;

export async function seedCategory(teamId: number, name = 'Groceries') {
    return returningOne(
        db.insert(categories).values({
            teamId,
            name,
            type: 'expense',
            color: '#0aa',
            icon: 'cart',
        }).returning()
    );
}

export async function seedTeamUser(): Promise<{ teamId: number; userId: number }> {
    const [team] = await db.insert(teams).values({ name: 'Team A' }).returning();
    const [user] = await db.insert(users).values({
        email: `a+${Date.now()}@example.com`,
        username: `a_${Date.now()}`,
        name: 'User A',
    }).returning();
    await db.insert(memberships).values({ userId: user.id, teamId: team.id, role: 'owner' });
    return { teamId: team.id, userId: user.id };
}

export async function seedAccount(teamId: number, name = 'Checking') {
    const [acct] = await db.insert(accounts).values({
        teamId, name, type: 'bank', currency: 'EUR',
    }).returning();
    return acct;
}

export async function seedBudget(
    teamId: number,
    categoryId: number,
    month = '2025-08',
    amountCents = 30000
) {
    const [row] = await db.insert(budgets).values({
        teamId,
        categoryId,
        periodMonth: toMonthStart(month), // "YYYY-MM-01"
        amountCents,
        rollover: false,
    }).returning();
    return row;
}
