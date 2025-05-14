import { prisma } from '@/lib/prisma'

export async function getCategoryById(categoryId: number) {
    return await prisma.category.findUnique({
        where: { id: categoryId },
    })
}

export async function getCategoryByName(name: string) {
    return await prisma.category.findFirst({
        where: { name },
    })
}

export async function getAllCategories() {
    return await prisma.category.findMany()
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
