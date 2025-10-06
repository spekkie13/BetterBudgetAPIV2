import {KeyedRepo} from "@/adapters/repo/factory/keyedRepo";

export abstract class KeyedRepoServiceBase<
    TEntity,
    TId = number,
    TCreate = Partial<TEntity>,
    TPatch = Partial<TEntity>
> {
    protected constructor(protected readonly repo: KeyedRepo<TEntity, TId, TCreate, TPatch>) {}

    // ✅ your recurring fragment, implemented once
    insert = (v: TCreate) => this.repo.create(v);
    selectById = (id: TId) => this.repo.getById(id);
    updateById = (id: TId, p: TPatch) => this.repo.updateById(id, p);
    deleteById = (id: TId) => this.repo.deleteById(id);
    exists = (id: TId) => this.repo.exists(id);
    listAll = () => this.repo.listAll();
}
