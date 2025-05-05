export class RecentPeriodResult implements IRecentPeriodResult{
    budgetId : number
    categoryId : number
    id : number
    spent : number
    percentage_spent : number
    userId: number

    constructor(data : IRecentPeriodResult) {
        this.id = data.id
        this.categoryId = data.categoryId
        this.spent = data.spent
        this.budgetId = data.budgetId
        this.percentage_spent = data.percentage_spent
        this.userId = data.userId
    }

    public ToString() : string {
        return `Recent period result: Id: ${this.id}, Category ID: ${this.categoryId}, Spent: ${this.spent}, Budget ID: ${this.budgetId}, Percentage Spent: ${this.percentage_spent}, User ID: ${this.userId}`
    }
}

interface IRecentPeriodResult{
    budgetId : number,
    categoryId : number,
    id: number,
    spent : number,
    percentage_spent : number
    userId: number
}
