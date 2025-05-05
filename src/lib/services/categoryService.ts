import { prisma } from '@/lib/prisma'

export async function getCategoriesByFilters(userId?: number, categoryId?: number) {
    const where: any = {}

    if (typeof userId === 'number') {
        where.userId = userId
    }

    if (typeof categoryId === 'number') {
        where.id = categoryId
    }

    return await prisma.category.findMany({ where })
}

export async function createCategory(data: any) {
    return await prisma.category.create({ data })
}

export async function deleteCategoryById(categoryId: number) {
    return await prisma.category.deleteMany({ where: { id: categoryId } })
}

export async function updateCategory(data: any) {
    return await prisma.category.update({
        where: { id: data.id },
        data,
    })
}
