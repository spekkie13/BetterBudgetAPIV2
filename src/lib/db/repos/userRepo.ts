import {db} from "@/db/client";
import {accounts} from "@/db/schema";
import {eq} from "drizzle-orm";

export async function getCurrency(accountId: number): Promise<string | null> {
    const [row] = await db
        .select({ currency: accounts.currency })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);
    return row?.currency ?? null;
}
