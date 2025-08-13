import * as usr from "@/lib/services/userService";

export async function getTeamIdByUser(u: any) : Promise<number>{
    const team = await usr.ensurePersonalTeam(u.id)

    let teamId: number;
    if (team) {
        teamId = team.id;
    } else {
        const profile = await usr.getSessionProfile(u.id);
        teamId = profile?.memberships[0]?.teamId ?? 0
    }

    return teamId;
}
