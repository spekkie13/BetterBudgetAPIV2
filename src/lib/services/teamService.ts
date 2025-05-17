import { prisma } from "@/lib/prisma";

// Create a new team
export async function createTeam(data: { name: string }) {
    return await prisma.team.create({
        data: {
            name: data.name,
        },
    });
}

// Get all teams
export async function getTeams() {
    return await prisma.team.findMany();
}

// Get a specific team by ID including its users
export async function getTeamById(teamId: number) {
    return await prisma.team.findUnique({
        where: { id: teamId },
        include: { users: true },
    });
}

// Update a team's name
export async function updateTeam(data: { id: number; name?: string }) {
    return await prisma.team.update({
        where: { id: data.id },
        data: {
            name: data.name,
        },
    });
}

// Delete a team by ID
export async function deleteTeam(teamId: number) {
    return await prisma.team.delete({
        where: { id: teamId },
    });
}
