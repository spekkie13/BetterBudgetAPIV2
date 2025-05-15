import { prisma } from '@/lib/prisma'

export async function getCategoryById(categoryId: number, userId: number) {
    return await prisma.category.findUnique({
        where: {
            userId,
            id: categoryId
        },
    })
}

export async function getCategoryByName(name: string, userId: number) {
    return await prisma.category.findFirst({
        where: {
            name,
            userId
        },
    })
}

export async function getAllCategories(userId: number) {
    return await prisma.category.findMany({
        where: {
            userId
        }
    })
}

export async function createCategory(data: {
    name: string
    color: string
    icon: string
    userId: number
}) {
    return await prisma.category.create({ data })
}

export async function deleteCategoryById(categoryId: number) {
    return await prisma.category.deleteMany({
        where: { id: categoryId },
    })
}

export async function updateCategory(data: {
    id: number
    name?: string
    color?: string
    icon?: string
    userId?: number
}) {
    return await prisma.category.update({
        where: { id: data.id },
        data,
    })
}
