import { describe, it, expect } from 'vitest';
import * as usr from '@/lib/services/userService';
import * as cat from '@/lib/services/categoryService';
import {getTeamIdByUser} from "../utils/teamUtils";

describe('categoryService', () => {
    it('CRUD categories incl. parentId and type', async () => {
        const u = await usr.ensureAppUser({ email: 'e@example.com' });
        const teamId = await getTeamIdByUser(u)

        const parent = await cat.createCategory({ teamId: teamId, name: 'Parent', color: '#111', icon: 'p' });
        const child = await cat.createCategory({ teamId: teamId, name: 'Child', color: '#222', icon: 'c', parentId: parent.id });

        const byTeam = await cat.getAllCategories(teamId);
        expect(byTeam.find((c: any) => c.id === parent.id)).toBeTruthy();
        expect(byTeam.find((c: any) => c.id === child.id)?.parentId).toBe(parent.id);

        const up = await cat.updateCategory({ id: child.id, teamId: teamId, type: 'income' });
        expect(up?.type).toBe('income');

        const byName = await cat.getCategoryByName('child', teamId);
        expect(byName?.id).toBe(child.id);

        await cat.deleteCategoryById(parent.id, teamId);
        const after = await cat.getAllCategories(teamId);
        expect(after.some((c: any) => c.id === parent.id)).toBe(false);
    });
});
