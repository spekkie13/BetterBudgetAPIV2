export class PeriodBudget implements IPeriodBudget{
    budget: number
    categoryId: number
    id: number
    year: number
    month: number
    userId: number

    constructor(data : IPeriodBudget) {
        this.budget = data.budget
        this.categoryId = data.categoryId
        this.id = data.id
        this.year = data.year
        this.month = data.month
        this.userId = data.userId
    }

    public ToString() : string{
        return `PeriodBudget - Id: ${this.id}, Budget: ${this.budget}, Category Id: ${this.categoryId}, Year: ${this.year}, Month: ${this.month}, User ID: ${this.userId}`
    }
}

interface IPeriodBudget{
    budget: number,
    categoryId: number,
    id: number,
    month: number,
    year: number,
    userId: number
}
