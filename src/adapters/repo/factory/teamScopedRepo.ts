export interface TeamScopedRepo<TEntity, TId, TTeamId, TCreate, TPatch> {
    create(values: TCreate): Promise<TEntity>;
    getById(teamId: TTeamId, id: TId): Promise<TEntity | null>;
    listByTeam(teamId: TTeamId): Promise<TEntity[]>;
    updateById(teamId: TTeamId, id: TId, patch: TPatch): Promise<TEntity | null>;
    deleteById(teamId: TTeamId, id: TId): Promise<void>;
    exists(teamId: TTeamId, id: TId): Promise<boolean>;
}
