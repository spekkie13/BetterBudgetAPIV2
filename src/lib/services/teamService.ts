import {prisma} from "@/lib/prisma";

export async function findTeam(teamId: number){
    return await prisma.team.findUnique({
        where: {id: teamId},
        include: {users: true},
    });
}
