import {prisma} from "@/lib/prisma";

export async function findTeam(teamId: string){
    return await prisma.team.findUnique({where:{id: Number(parseInt(teamId))}})
}
