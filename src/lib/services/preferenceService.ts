import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Fetch all preferences for a user
export async function getUserPreferencesByUserId(userId: number) {
    return prisma.userPreference.findMany({
        where: { userId },
    });
}

// Fetch preference by its unique ID
export async function getUserPreferenceById(id: number) {
    return prisma.userPreference.findUnique({
        where: { id },
    });
}

// Fetch a single preference by name and user (case-insensitive)
export async function getUserPreferenceByName(name: string, userId: number) {
    return prisma.userPreference.findFirst({
        where: {
            userId,
            name: {
                equals: name,
                mode: 'insensitive',
            },
        },
    });
}

// Create a new user preference
export async function createUserPreference(data: Prisma.UserPreferenceCreateInput) {
    return prisma.userPreference.create({ data });
}

// Update an existing user preference
export async function updateUserPreference(data: Prisma.UserPreferenceUpdateInput & { id: number }) {
    const { id, ...updateData } = data;
    return prisma.userPreference.update({
        where: { id },
        data: updateData,
    });
}

// Delete a preference by ID
export async function deleteUserPreferenceById(id: number) {
    return prisma.userPreference.delete({
        where: { id },
    });
}
