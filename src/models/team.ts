interface TeamData {
    id: number;
    name: string;
    createdAt?: Date;
}

export class Team {
    id: number
    name: string
    createdAt: Date

    private constructor(team: TeamData){
        this.id = team.id;
        this.name = team.name;
        this.createdAt = team.createdAt ?? new Date();
    }

    static create(team: TeamData): Team {
        return new Team(team);
    }

    static empty(): Team {
        return new Team({
            id: 0,
            name: '',
            createdAt: new Date(),
        })
    }
}
