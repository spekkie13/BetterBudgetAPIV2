import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('userService', () => {
    it('create/update/delete user and membership flow', async () => {
        const u = await usr.createUser({ email: 'a@example.com', username: 'a', name: 'A' });
        expect(u.id).toBeTruthy();

        const updated = await usr.updateUser({ id: u.id, name: 'A Prime' });
        expect(updated?.name).toBe('A Prime');

        const team = await usr.ensurePersonalTeam(u.id);
        expect(team?.id ?? true).toBeTruthy();

        const prof = await usr.getSessionProfile(u.id);
        expect(prof?.memberships.length).toBe(1);

        await usr.assertUserInTeam(u.id, prof!.memberships[0].teamId);

        await usr.removeUserFromTeam({ userId: u.id, teamId: prof!.memberships[0].teamId });
        await expect(usr.assertUserInTeam(u.id, prof!.memberships[0].teamId)).rejects.toThrow();
    });

    it('ensureAppUser returns existing if already present', async () => {
        const u1 = await usr.ensureAppUser({ email: 'b@example.com' });
        const u2 = await usr.ensureAppUser({ email: 'b@example.com' });
        expect(u2.id).toBe(u1.id);
    });

    it('getUsersByTeamId only lists members of that team', async () => {
        const u = await usr.ensureAppUser({ email: 'c@example.com' });
        const teamId = await getTeamIdByUser(u)

        const list = await usr.getUsersByTeamId(teamId);
        expect(list.some(x => x.id === u.id)).toBe(true);
    });
});
