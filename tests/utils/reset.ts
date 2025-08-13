import { db } from '@/lib/db/client';
import {
    transactionSplits,
    transactions,
    budgets,
    recurringRules,
    categories,
    accounts,
    memberships,
    userSettings,
    users,
    teams,
} from '@/lib/db/schema';

export async function truncateAll() {
    await db.transaction(async (tx) => {
        await tx.delete(transactionSplits);
        await tx.delete(transactions);

        await tx.delete(budgets);
        await tx.delete(recurringRules);

        await tx.delete(categories);
        await tx.delete(accounts);

        await tx.delete(memberships);
        await tx.delete(userSettings);

        await tx.delete(users);
        await tx.delete(teams);
    });
}
