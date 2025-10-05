import {TeamScopedRepo} from "@/adapters/repo/factory/teamScopedRepo";

export abstract class TeamScopedServiceBase<
    TEntity,
    TId = number,
    TTeamId = number,
    TCreate = Partial<TEntity>,
    TPatch = Partial<TEntity>
> {
    protected constructor(protected readonly repo: TeamScopedRepo<TEntity, TId, TTeamId, TCreate, TPatch>) {}

    // ✅ your recurring fragment, implemented once
    insert = (v: TCreate) => this.repo.create(v);
    selectByIdTeam = (teamId: TTeamId, id: TId) => this.repo.getById(teamId, id);
    selectAllByTeam = (teamId: TTeamId) => this.repo.listByTeam(teamId);
    updateByIdTeam = (teamId: TTeamId, id: TId, p: TPatch) => this.repo.updateById(teamId, id, p);
    deleteByIdTeam = (teamId: TTeamId, id: TId) => this.repo.deleteById(teamId, id);
    exists = (teamId: TTeamId, id: TId) => this.repo.exists(teamId, id);
}
