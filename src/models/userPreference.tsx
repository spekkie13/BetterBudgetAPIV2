    export class userPreference implements IUserPreference{
        id: number
        userId: number
        name: string
        stringValue: string
        numberValue: number
        dateValue: Date

        constructor(data: IUserPreference) {
            this.id = data.id
            this.userId = data.userId
            this.name = data.name
            this.stringValue = data.stringValue
            this.numberValue = data.numberValue
            this.dateValue = data.dateValue
        }
    }

interface IUserPreference{
    id: number,
    userId: number,
    name: string,
    stringValue: string,
    numberValue: number,
    dateValue: Date
}
