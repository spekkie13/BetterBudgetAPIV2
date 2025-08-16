// lib/services/team/teamTypes.ts
export type TeamDTO = {
    id: number;
    name: string;
    createdAt: Date;
};

export type TeamMemberDTO = {
    userId: number;
    email: string;
    username: string;
    name: string | null;
    role: string;      // narrow to enum if your schema has one
    joinedAt: Date;
};

export type TeamWithMembersDTO = {
    team: TeamDTO;
    members: TeamMemberDTO[];
};
