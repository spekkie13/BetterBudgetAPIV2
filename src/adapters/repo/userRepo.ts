import {makeKeyedRepo} from "@/adapters/repo/factory/makeKeyedRepo";
import { db } from "@/db/client";
import {users} from "@/db/schema";

export function makeUserRepo() {
    return makeKeyedRepo(db, users, users.id);
}
