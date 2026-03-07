import {AccountInsert, AccountPatch, AccountRow} from "@/db/types/accountTypes";
import {db} from "@/db/client";
import {accounts} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export class AccountRepository {
    async create(data: AccountInsert) : Promise<AccountRow> {
        const [row] = await db
            .insert(accounts)
            .values(data)
            .returning()

        return row;
    }

    async getById(teamId: number, id: number) : Promise<AccountRow> {
        const [row] = await db
            .select()
            .from(accounts)
            .where(
                and(
                    eq(accounts.teamId, teamId),
                    eq(accounts.id, id)
                )
            )
            .limit(1);

        return row;
    }

    async listByTeam(teamId: number, includeArchived: boolean) : Promise<AccountRow[]> {
        const rows = await db
            .select()
            .from(accounts)
            .where(eq(accounts.teamId, teamId));

        if (!includeArchived)
            return rows.filter(row => !row.isArchived);

        return rows;
    }

    async updateById(teamId: number, id: number, data: AccountPatch) : Promise<AccountRow> {
        const [row] = await db
            .update(accounts)
            .set(data)
            .where(
                and(
                    eq(accounts.teamId, teamId),
                    eq(accounts.id, id)
                )
            )
            .returning();

        return row;
    }

    async deleteById(teamId: number, id: number) : Promise<void> {
        await db
            .delete(accounts)
            .where(
                and(
                    eq(accounts.teamId, teamId),
                    eq(accounts.id, id)
                )
            );
    }

    async exists(teamId: number, id: number) : Promise<boolean> {
        const [row] = await db
            .select()
            .from(accounts)
            .where(
                and(
                    eq(accounts.teamId, teamId),
                    eq(accounts.id, id)
                )
            )
            .limit(1);

        if (!row)
            return false;

        return true;
    }
}

export const accountRepository = new AccountRepository();
