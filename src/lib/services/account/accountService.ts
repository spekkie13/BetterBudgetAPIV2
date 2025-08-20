import * as accountRepo from '@/lib/db/repos/accountRepo';
import type { AccountInsert, AccountPatch, AccountRow } from '@/lib/domain/account';

type CreateAccountInput = {
    teamId: number;
    name: string;
    type: string;                                               // 'bank' | 'cash' | 'credit' | ...
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD';       // optional; DB default is 'EUR'
};

type UpdateAccountInput = {
    teamId: number;
    id: number;
    patch: AccountPatch;
};

export async function createAccount(input: CreateAccountInput): Promise<AccountRow> {
    // Let DB apply default('EUR') if currency is undefined
    const values: AccountInsert = {
        teamId: input.teamId,
        name: input.name,
        type: input.type,
        ...(input.currency ? { currency: input.currency } : {}),
        // isArchived defaults to false in DB
    } as AccountInsert;

    return accountRepo.insert(values);
}

export async function getAccountById(teamId: number, id: number): Promise<AccountRow | null> {
    return accountRepo.selectByIdTeam(teamId, id);
}

export async function getAccountsForTeam(teamId: number): Promise<AccountRow[]> {
    return accountRepo.selectAllByTeam(teamId);
}

export async function updateAccount(input: UpdateAccountInput): Promise<AccountRow | null> {
    if (!input.patch || Object.keys(input.patch).length === 0) {
        // no-op: return current state (or null if not found)
        return accountRepo.selectByIdTeam(input.teamId, input.id);
    }
    // Only allow patching fields that exist in schema: name, type, currency, isArchived
    const allowed: AccountPatch = {};
    if (input.patch.name !== undefined) allowed.name = input.patch.name;
    if (input.patch.type !== undefined) allowed.type = input.patch.type;
    if (input.patch.currency !== undefined) allowed.currency = input.patch.currency;
    if (input.patch.isArchived !== undefined) allowed.isArchived = input.patch.isArchived;

    return accountRepo.updateByIdTeam(input.teamId, input.id, allowed as Partial<AccountInsert>);
}

export async function archiveAccount(teamId: number, id: number): Promise<AccountRow | null> {
    return accountRepo.updateByIdTeam(teamId, id, { isArchived: true });
}

export async function unarchiveAccount(teamId: number, id: number): Promise<AccountRow | null> {
    return accountRepo.updateByIdTeam(teamId, id, { isArchived: false });
}

export async function deleteAccount(teamId: number, id: number): Promise<void> {
    await accountRepo.deleteByIdTeam(teamId, id);
}

// ---------- Guards ----------
export async function assertAccountBelongsToTeam(teamId: number, accountId: number) {
    const ok = await accountRepo.exists(teamId, accountId);
    if (!ok) throw new Error('Forbidden: account does not belong to team');
}
