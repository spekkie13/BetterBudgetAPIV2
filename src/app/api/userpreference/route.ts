import { NextRequest, NextResponse } from 'next/server'
import {
    getUserPreferencesByUserId,
    getUserPreferenceById,
    createUserPreference,
    updateUserPreference,
    deleteUserPreferenceById,
} from '@/lib/services/userpreferenceService'
import { jsonWithCors, corsHeaders } from '@/lib/cors'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    const userIdParam = searchParams.get('userId')

    if (idParam) {
        const id = parseInt(idParam)
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400)

        const pref = await getUserPreferenceById(id)
        return jsonWithCors(pref)
    }

    if (userIdParam) {
        const userId = parseInt(userIdParam)
        if (isNaN(userId)) return jsonWithCors({ error: 'Invalid userId' }, 400)

        const prefs = await getUserPreferencesByUserId(userId)
        return jsonWithCors(prefs)
    }

    return jsonWithCors({ error: 'Missing id or userId' }, 400)
}

export async function POST(req: NextRequest) {
    const data = await req.json()

    try {
        const created = await createUserPreference(data)
        return jsonWithCors(created)
    } catch (err) {
        console.error('Create error:', err)
        return jsonWithCors({ error: 'Failed to create user preference' }, 500)
    }
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return jsonWithCors({ error: 'Missing ID for update' }, 400)
    }

    try {
        const updated = await updateUserPreference(data)
        return jsonWithCors(updated)
    } catch (err) {
        console.error('Update error:', err)
        return jsonWithCors({ error: 'Failed to update user preference' }, 500)
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    const id = parseInt(idParam || '')

    if (isNaN(id)) {
        return jsonWithCors({ error: 'Invalid ID' }, 400)
    }

    try {
        await deleteUserPreferenceById(id)
        return jsonWithCors({ success: true })
    } catch (err) {
        console.error('Delete error:', err)
        return jsonWithCors({ error: 'Failed to delete user preference' }, 500)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
