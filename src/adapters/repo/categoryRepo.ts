import { db } from '@/db/client'
import {categories} from "@/db/schema/categories"
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeCategoryRepo() {
    return makeTeamScopedRepo(db, categories, categories.id, categories.teamId)
}
