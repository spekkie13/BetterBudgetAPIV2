import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { TeamScopedRepo } from "@/adapters/repo/factory/teamScopedRepo";
import type { InsertOf, PatchOf, SelectOf } from "@/db/types/generic";
import {andAll, ColData, IdNamed, IdTuple, Table} from "@/adapters/repo/factory/repoHelpers";

/** ---------- Overloads (3 shapes) ---------- **/

// 1) Single-column PK
export function makeTeamScopedRepo<
    TTable extends Table,
    TIdCol extends AnyPgColumn,
    TTeamCol extends AnyPgColumn
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCol,
    teamCol: TTeamCol
): TeamScopedRepo<SelectOf<TTable>, ColData<TIdCol>, ColData<TTeamCol>, InsertOf<TTable>, PatchOf<TTable>>;

// 2) Tuple PK (array of columns, order matters)
export function makeTeamScopedRepo<
    TTable extends Table,
    TIdCols extends readonly AnyPgColumn[],
    TTeamCol extends AnyPgColumn
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCols,
    teamCol: TTeamCol
): TeamScopedRepo<SelectOf<TTable>, IdTuple<TIdCols>, ColData<TTeamCol>, InsertOf<TTable>, PatchOf<TTable>>;

// 3) Named PK (object of columns)
export function makeTeamScopedRepo<
    TTable extends Table,
    TIdCols extends Record<string, AnyPgColumn>,
    TTeamCol extends AnyPgColumn
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCols,
    teamCol: TTeamCol
): TeamScopedRepo<SelectOf<TTable>, IdNamed<TIdCols>, ColData<TTeamCol>, InsertOf<TTable>, PatchOf<TTable>>;

/** ---------- Implementation ---------- **/
export function makeTeamScopedRepo(
    db: any,
    table: Table,
    idDescriptor: AnyPgColumn | readonly AnyPgColumn[] | Record<string, AnyPgColumn>,
    teamCol: AnyPgColumn
) {
    type Row    = SelectOf<typeof table>;
    type Insert = InsertOf<typeof table>;
    type Patch  = PatchOf<typeof table>;

    // Build the ID predicate from any descriptor shape
    const idWhere = (id: unknown): SQL => {
        if (Array.isArray(idDescriptor)) {
            // tuple key: id is an array of same length
            const cols = idDescriptor as readonly AnyPgColumn[];
            const arr  = id as unknown[];
            const parts = cols.map((col, i) => eq(col as AnyPgColumn, arr[i] as any));
            return andAll(parts);
        } else if (typeof idDescriptor === "object" && !("name" in (idDescriptor as AnyPgColumn))) {
            // named key: id is an object with same keys
            const cols = idDescriptor as Record<string, AnyPgColumn>;
            const obj  = id as Record<string, unknown>;
            const parts = Object.keys(cols).map(k => eq(cols[k] as AnyPgColumn, obj[k] as any));
            return andAll(parts);
        } else {
            // single column key
            return eq(idDescriptor as AnyPgColumn, id as any);
        }
    };

    const whereTeam = (teamId: unknown) => eq(teamCol as AnyPgColumn, teamId as any);

    const repo: TeamScopedRepo<any, any, any, Insert, Patch> = {
        async create(values: Insert) {
            const [row] = await db.insert(table).values(values).returning();
            return row as Row;
        },

        async getById(teamId: unknown, id: unknown) {
            const [row] = await db
                .select()
                .from(table)
                .where(and(whereTeam(teamId), idWhere(id)))
                .limit(1);
            return (row as Row) ?? null;
        },

        async listByTeam(teamId: unknown) {
            return db
                .select()
                .from(table)
                .where(whereTeam(teamId)) as Promise<Row[]>;
        },

        async updateById(teamId: unknown, id: unknown, patch: Patch) {
            const [row] = await db
                .update(table)
                .set(patch as any)
                .where(and(whereTeam(teamId), idWhere(id)))
                .returning();
            return (row as Row) ?? null;
        },

        async deleteById(teamId: unknown, id: unknown) {
            await db
                .delete(table)
                .where(and(whereTeam(teamId), idWhere(id)));
        },

        async exists(teamId: unknown, id: unknown) {
            const [row] = await db
                .select({ one: db.sql`1` })
                .from(table)
                .where(and(whereTeam(teamId), idWhere(id)))
                .limit(1);
            return !!row;
        },
    };

    return repo;
}
