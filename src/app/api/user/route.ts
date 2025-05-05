import { NextRequest } from 'next/server'
import { getUserByEmail } from '@/lib/services/userService'
import {jsonWithCors} from '@/lib/cors'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
        return jsonWithCors({ error: 'Missing email' }, 400)
    }

    try {
        const user = await getUserByEmail(email)

        if (!user) {
            return jsonWithCors({ error: 'User not found' }, 404)
        }

        return jsonWithCors(user)
    } catch (err) {
        console.error('API error:', err)
        return jsonWithCors({ error: 'Internal Server Error' }, 500)
    }
}
