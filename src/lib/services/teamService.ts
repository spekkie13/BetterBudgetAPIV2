import {prisma} from "@/lib/prisma";

export async function findTeam(){
    return await prisma.team.findMany()
}
