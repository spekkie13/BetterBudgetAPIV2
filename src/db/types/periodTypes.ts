import {z} from "zod";
import {zDateTime, zTeamId} from "@/db/types/common";

export const BodySchema = z.object({
    teamId: zTeamId,
    nowISO: zDateTime,
})
