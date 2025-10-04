import { makeCategoryRepo } from "@/adapters/repo/categoryRepo";

const repo = makeCategoryRepo()

export const insert          = (v: Parameters<typeof repo.create>[0]) => repo.create(v);
export const selectByIdTeam  = (teamId: number, id: number) => repo.getById(teamId, id);
export const selectAllByTeam = (teamId: number) => repo.listByTeam(teamId);
export const updateByIdTeam  = (teamId: number, id: number, p: any) => repo.updateById(teamId, id, p);
export const deleteByIdTeam  = (teamId: number, id: number) => repo.deleteById(teamId, id);
export const exists          = (teamId: number, id: number) => repo.exists(teamId, id);
export const selectByName = (teamId: number, name: string) => repo.selectByName(teamId, name);
export const ensureAllExistForTeam = (teamId: number, catIds: number[]) => repo.ensureAllExistForTeam(teamId, catIds)
