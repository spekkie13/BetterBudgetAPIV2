/** ---------- Helpers ---------- **/
import {AnyPgColumn, PgTableWithColumns} from "drizzle-orm/pg-core";
import {and, SQL} from "drizzle-orm";

export type Table = PgTableWithColumns<any>;

export type ColData<T extends AnyPgColumn> =
    T["_"]["notNull"] extends true ? T["_"]["data"] : T["_"]["data"] | null;

export type IdTuple<TCols extends readonly AnyPgColumn[]> = {
    [I in keyof TCols]: TCols[I] extends AnyPgColumn ? ColData<TCols[I]> : never;
};

export type IdNamed<TCols extends Record<string, AnyPgColumn>> = {
    [K in keyof TCols]: ColData<TCols[K]>;
};

export function andAll(parts: SQL[]): SQL {
    return parts.reduce<SQL | undefined>(
        (acc, c) => (acc ? and(acc, c) : c),
        undefined
    )!;
}
