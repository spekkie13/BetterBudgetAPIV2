export class Period implements IPeriod{
    id: number
    startDate: Date
    endDate: Date
    startingAmount: number

    constructor(data : IPeriod)
    {
        this.id = data.id
        this.startDate = data.startDate
        this.endDate = data.endDate
        this.startingAmount = data.startingAmount
    }
}

interface IPeriod {
    id: number,
    startDate: Date,
    endDate: Date,
    startingAmount: number,
}
