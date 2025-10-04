type PeriodStart = 'calendar_month' | 'anchored_month'

export interface ITeamSettings {
    id: number;
    teamId: number;
    periodStart: PeriodStart;
    anchor_day: number;          // 1..31
    anchor_timezone: string;     // e.g. 'Europe/Amsterdam'
}

export class TeamSettings implements ITeamSettings {
    id: number;
    teamId: number;
    periodStart: PeriodStart;
    anchor_day: number;
    anchor_timezone: string;

    constructor(data: ITeamSettings) {
        this.id = data.id;
        this.teamId = data.teamId;
        this.periodStart = data.periodStart;
        this.anchor_day = data.anchor_day;
        this.anchor_timezone = data.anchor_timezone;
    }

    static empty(){
        return new TeamSettings({
            id: 0,
            teamId: 0,
            periodStart: "calendar_month",
            anchor_day: 1,
            anchor_timezone: "Europe/Amsterdam"
        })
    }
}
