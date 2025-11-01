export class Team {
    id: number
    name: string
    createdAt: Date

    private constructor(team: any){
        this.id = team.id;
        this.name = team.name;
        this.createdAt = team.created_at;
    }

    static create(team: any) {
        return new Team(team);
    }

    static empty() {
        return new Team({
            id: 0,
            name: '',
            createdAt: new Date(),
        })
    }

    static isEmpty(team: Team) {
        return team === Team.empty();
    }
}
