import { NextRequest } from 'next/server';
import { BudgetBody, BudgetParams, BudgetQuery } from "@/db/types/budgetTypes";
import { budgetService } from "@/service/budgetService";
import {ok, preflightResponse, getUserDataByToken, toApiResponse} from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import { AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError } from "@/models/errors";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const sp = new URL(req.url).searchParams;

        const params = BudgetQuery.safeParse({
            categoryId: sp.get("categoryId") ? Number(sp.get("categoryId")) : undefined,
            periodMonth: sp.get("periodMonth"),
        });
        if (!params.success) {
            const errors = params.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const budgets = await budgetService.getBudgets(
            team.id,
            params.data.periodMonth,
            params.data.categoryId,
        );

        return ok(req, budgets);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const body = await req.json().catch(() => ({}));
        const parsedBody = BudgetBody.safeParse(body);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const budgetBody = {
            teamId: team.id,
            categoryId: parsedBody.data.categoryId ?? 0,
            periodMonth: parsedBody.data.periodMonth ?? "",
            amountCents: parsedBody.data.amountCents ?? 0,
            rollover: parsedBody.data.rollover ?? false,
        }

        const createdBudget = await budgetService.createBudget(budgetBody);
        return ok(req, createdBudget);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const sp = new URL(req.url).searchParams;
        const id = sp.get("id");
        const parsedParams = BudgetParams.safeParse({ id: id });
        if (!parsedParams.success) {
            const errors = parsedParams.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const body = await req.json().catch(() => ({}));
        const parsedBody = BudgetBody.safeParse(body);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const budgetBody = {
            amountCents: parsedBody.data.amountCents ?? 0,
            rollover: parsedBody.data.rollover ?? false,
        }

        const updatedBudget = await budgetService.updateBudget(team.id, parsedParams.data.id, budgetBody);
        return ok(req, updatedBudget);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}
