import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('accountService', () => {
    it('CRUD and unique name per team', async () => {
        const u = await usr.ensureAppUser({ email: 'd@example.com' });
        const teamId = await getTeamIdByUser(u);

        const a1 = await usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' });
        expect(a1.id).toBeTruthy();

        // unique per team
        await expect(usr.createAccount({ teamId: teamId, name: 'Checking', type: 'bank', currency: 'EUR' }))
            .rejects.toThrow();

        // update
        const upd = await usr.updateAccount({ id: a1.id, isArchived: true });
        expect(upd?.isArchived).toBe(true);

        // list
        const list = await usr.getAccountsByTeamId(teamId);
        expect(list.length).toBe(1);

        // delete
        await usr.deleteAccount(a1.id);
        const after = await usr.getAccountsByTeamId(teamId);
        expect(after.some(x => x.id === a1.id)).toBe(false);
    });
});
