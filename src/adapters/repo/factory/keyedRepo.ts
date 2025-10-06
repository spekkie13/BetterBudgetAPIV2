export interface KeyedRepo<TEntity, TId, TCreate, TPatch> {
    create(v: TCreate): Promise<TEntity>;
    getById(id: TId): Promise<TEntity | null>;
    findById(id: TId): Promise<TEntity | null>;
    listAll(): Promise<TEntity[]>;
    updateById(id: TId, patch: TPatch): Promise<TEntity | null>;
    deleteById(id: TId): Promise<void>;
    exists(id: TId): Promise<boolean>;
}
