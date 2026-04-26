import { NextRequest, NextResponse } from "next/server";
import { ok, preflightResponse, toApiResponse } from "@/core/http/ApiHelpers";
import { AppError, ZodValidationError } from "@/models/errors";
import { userService } from "@/service/userService";
import { ProvisionBody } from "@/db/types/userTypes";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
    return preflightResponse(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json().catch(() => ({}));
        const parsed = ProvisionBody.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            throw new ZodValidationError(errors);
        }

        const userWithTeam = await userService.provisionFromSupabase(parsed.data);
        return ok(req, userWithTeam, 'Created', 201);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}