import {prisma} from "@/lib/prisma";

export async function createTeam(body: any){
    return await prisma.team.create({
        data: {
            name: body.name,
        },
    });
}

export async function getTeams() {
    return await prisma.team.findMany()
}

export async function findTeam(teamId: number){
    return await prisma.team.findUnique({
        where: {id: teamId},
        include: {users: true},
    });
}

export async function updateTeam(body: any){
    return await prisma.team.update({
        where: { id: body.id },
        data: body,
    });
}

export async function deleteTeam(teamId: number){
    return await prisma.team.delete({ where: { id: teamId } });
}
