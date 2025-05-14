import { prisma } from '@/lib/prisma'

export async function getUserPreferencesByUserId(userId: number) {
    return await prisma.userPreference.findMany({
        where: { userId },
    })
}

export async function getUserPreferenceById(id: number) {
    return await prisma.userPreference.findUnique({
        where: { id },
    })
}

export async function getUserPreferenceByName(name: string) {
    return await prisma.userPreference.findFirst({
        where: { name: name },
    })
}

export async function createUserPreference(data: any) {
    return await prisma.userPreference.create({
        data,
    })
}

export async function updateUserPreference(data: any) {
    return await prisma.userPreference.update({
        where: { id: data.id },
        data,
    })
}

export async function deleteUserPreferenceById(id: number) {
    return await prisma.userPreference.delete({
        where: { id },
    })
}
