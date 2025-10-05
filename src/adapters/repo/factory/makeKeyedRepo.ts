import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import type { KeyedRepo } from "@/adapters/repo/factory/keyedRepo";
import type { InsertOf, PatchOf, SelectOf } from "@/db/types/generic";

/** ---------- Helpers ---------- **/

type Table = PgTableWithColumns<any>;

type ColData<T extends AnyPgColumn> =
    T["_"]["notNull"] extends true ? T["_"]["data"] : T["_"]["data"] | null;

type IdTuple<TCols extends readonly AnyPgColumn[]> = {
    [I in keyof TCols]: TCols[I] extends AnyPgColumn ? ColData<TCols[I]> : never;
};

type IdNamed<TCols extends Record<string, AnyPgColumn>> = {
    [K in keyof TCols]: ColData<TCols[K]>;
};

function andAll(parts: SQL[]): SQL {
    return parts.reduce<SQL | undefined>(
        (acc, c) => (acc ? and(acc, c) : c),
        undefined
    )!;
}

/** ---------- Overloads (3 shapes) ---------- **/

// 1) Single-column PK
export function makeKeyedRepo<
    TTable extends Table,
    TIdCol extends AnyPgColumn,
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCol,
): KeyedRepo<SelectOf<TTable>, ColData<TIdCol>, InsertOf<TTable>, PatchOf<TTable>>;

// 2) Tuple PK (array of columns, order matters)
export function makeKeyedRepo<
    TTable extends Table,
    TIdCols extends readonly AnyPgColumn[],
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCols,
): KeyedRepo<SelectOf<TTable>, IdTuple<TIdCols>, InsertOf<TTable>, PatchOf<TTable>>;

// 3) Named PK (object of columns)
export function makeKeyedRepo<
    TTable extends Table,
    TIdCols extends Record<string, AnyPgColumn>,
    TTeamCol extends AnyPgColumn
>(
    db: any,
    table: TTable,
    idDescriptor: TIdCols,
): KeyedRepo<SelectOf<TTable>, IdNamed<TIdCols>, InsertOf<TTable>, PatchOf<TTable>>;

/** ---------- Implementation ---------- **/
export function makeKeyedRepo(
    db: any,
    table: Table,
    idDescriptor: AnyPgColumn | readonly AnyPgColumn[] | Record<string, AnyPgColumn>,
) {
    type Row    = SelectOf<typeof table>;
    type Insert = InsertOf<typeof table>;
    type Patch  = PatchOf<typeof table>;

    // Build the ID predicate from any descriptor shape
    const idWhere = (id: unknown): SQL => {
        if (Array.isArray(idDescriptor)) {
            // tuple key: id is an array of the same length
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

    const repo: KeyedRepo<any, any, Insert, Patch> = {
        async create(values: Insert) {
            const [row] = await db.insert(table).values(values).returning();
            return row as Row;
        },

        async getById(id: unknown) {
            const [row] = await db
                .select()
                .from(table)
                .where(idWhere(id))
                .limit(1);
            return (row as Row) ?? null;
        },

        async findById(id: unknown) {
            const [row] = await db
                .select()
                .from(table)
                .where(idWhere(id))
                .limit(1);
            return (row as Row) ?? null;
        },

        async listAll() {
            return db
                .select()
                .from(table) as Promise<Row[]>;
        },

        async updateById(id: unknown, patch: Patch) {
            const [row] = await db
                .update(table)
                .set(patch as any)
                .where(idWhere(id))
                .returning();
            return (row as Row) ?? null;
        },

        async deleteById(id: unknown) {
            await db
                .delete(table)
                .where(idWhere(id));
        },

        async exists(id: unknown) {
            const [row] = await db
                .select({ one: db.sql`1` })
                .from(table)
                .where(idWhere(id))
                .limit(1);
            return !!row;
        },
    };

    return repo;
}
