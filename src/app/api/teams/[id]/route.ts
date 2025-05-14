import {NextRequest, NextResponse} from "next/server";
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {deleteTeam, findTeam, updateTeam} from "@/lib/services/teamService";

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: corsHeaders,
        status: 204,
    })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const team = await findTeam(id)
        return jsonWithCors(team || {}, team ? 200 : 404);

    }
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);
        const body = await req.json();

        const updatedTeam = await updateTeam(body)
        return jsonWithCors(updatedTeam);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);
        await deleteTeam(id)
        return jsonWithCors({ message: 'Team deleted' });

    }
}

