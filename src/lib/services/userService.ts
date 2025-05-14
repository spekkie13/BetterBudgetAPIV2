import { prisma } from '@/lib/prisma'

export async function getUserByEmail(email: string) {
    return await prisma.user.findFirst({
        where: { email: email },
    })
}

export async function getUserById(id: number){
    return await prisma.user.findUnique({
        where: { id },
        include: { team: true },
    })
}
