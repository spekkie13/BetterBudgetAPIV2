import {
    createAccount,
    getAccountById,
    getAccountsForTeam,
    updateAccount,
    deleteAccount,
} from '@/lib/services/account/accountService';
import type { AccountsQueryInput, CreateAccountInput, UpdateAccountInput } from './accountSchemas';

/**
 * GET /teams/:teamId/accounts
 */
export async function listAccountsController(teamId: number, query: AccountsQueryInput) {
    const items = await getAccountsForTeam(teamId);
    const filtered = !query.includeArchived
        ? items.filter(a => !a.isArchived)
        : items;
    return { status: 200, body: filtered };
}

/**
 * GET /teams/:teamId/accounts/:id
 */
export async function getAccountController(teamId: number, id: number) {
    const row = await getAccountById(teamId, id);
    return row ? { status: 200, body: row } : { status: 404, body: { error: 'Account not found' } };
}

/**
 * POST /teams/:teamId/accounts
 */
export async function createAccountController(teamId: number, body: CreateAccountInput) {
    const created = await createAccount({
        teamId,
        name: body.name,
        type: body.type,
        currency: body.currency, // let DB default to 'EUR' when undefined
    });
    return { status: 201, body: created };
}

/**
 * PUT/PATCH /teams/:teamId/accounts/:id
 */
export async function updateAccountController(teamId: number, id: number, body: UpdateAccountInput) {
    const updated = await updateAccount({ teamId, id, patch: body });
    return updated ? { status: 200, body: updated } : { status: 404, body: { error: 'Account not found' } };
}

/**
 * DELETE /teams/:teamId/accounts/:id
 */
export async function deleteAccountController(teamId: number, id: number) {
    await deleteAccount(teamId, id);
    return { status: 204, body: null };
}
