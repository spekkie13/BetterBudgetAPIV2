import {makeKeyedRepo} from "@/adapters/repo/factory/makeKeyedRepo";
import {db} from "@/db/client";
import {userSettings} from "@/db/schema";
import {SelectOf} from "@/db/types/generic";
import {KeyedRepo} from "@/adapters/repo/factory/keyedRepo";

export function makeUserSettingsRepo() {
    type Entity = SelectOf<typeof userSettings>;
    type Create = Omit<Entity, "id" | "createdAt" | "updatedAt"> &
        Required<Pick<Entity, "theme" | "textSize" | "preferences">>;
    type Update = Partial<Pick<Entity, "theme" | "textSize" | "preferences">>;

    const base = makeKeyedRepo(db, userSettings, userSettings.userId);
    return base as KeyedRepo<Entity, number, Create, Update>;
}
