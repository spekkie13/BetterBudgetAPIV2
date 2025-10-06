// src/db/types.ts
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Table = PgTableWithColumns<any>;
export type SelectOf<TTable extends Table> = InferSelectModel<TTable>;
export type InsertOf<TTable extends Table> = InferInsertModel<TTable>;

// canonical “patch” = partial insert minus base immutable fields; tweak as needed
export type PatchOf<TTable extends Table> = Partial<Omit<InsertOf<TTable>, "id" | "createdAt" | "updatedAt">>;
