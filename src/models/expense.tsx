import {Period} from "@/models/period";

export class Expense implements IExpense{
  date: Period
  amount: number
  description: string
  categoryId: number
  isRecurring: boolean
  userId: number

  constructor(
      data: IExpense
  ) {
    this.date = data.date
    this.amount = data.amount
    this.description = data.description
    this.categoryId = data.categoryId
    this.isRecurring = data.isRecurring
    this.userId = data.userId
  }

  public ToString() : string {
    return `Expense - Date: ${this.date}, Amount: ${this.amount}, Description: ${this.description}, CategoryId: ${this.categoryId}, Is recurring: ${this.isRecurring}, User ID: ${this.userId})`
  }

}

interface IExpense {
  date: Period,
  amount: number,
  description: string,
  categoryId: number,
  isRecurring: boolean,
  userId: number
}
