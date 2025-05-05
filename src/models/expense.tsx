import {DateObj} from "@/models/dateObj";

export class Expense implements IExpense{
  id: number
  date: DateObj
  amount: number
  description: string
  categoryId: number
  isRecurring: boolean
  userId: number

  constructor(
      data: IExpense
  ) {
    this.id = data.id
    this.date = data.date
    this.amount = data.amount
    this.description = data.description
    this.categoryId = data.categoryId
    this.isRecurring = data.isRecurring
    this.userId = data.userId
  }

  public ToString() : string {
    return `Expense - Id: ${this.id}, Date: ${this.date}, Amount: ${this.amount}, Description: ${this.description}, CategoryId: ${this.categoryId}, Is recurring: ${this.isRecurring}, User ID: ${this.userId})`
  }

}

interface IExpense {
  id: number,
  date: DateObj,
  amount: number,
  description: string,
  categoryId: number,
  isRecurring: boolean,
  userId: number
}
