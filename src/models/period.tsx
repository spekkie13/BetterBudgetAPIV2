export class Period implements IDateObj{
    id: number
    year: number
    month: number
    day: number

    constructor(data : IDateObj)
    {
        this.id = data.id
        this.year = data.year
        this.month = data.month
        this.day = data.day
    }
}

interface IDateObj {
    id: number,
    year: number,
    month: number,
    day: number,
}
