import {Category} from "@/models/category"

export class Income {
    category: Category
    amount: number
    description: string
    description2: string
    incomeDate: Date
    isRecurring: boolean

    constructor(
        _category: Category,
        _description: string,
        _description2: string,
        _amount: number,
        _date: Date,
        _isRecurring: boolean)
    {
        this.category = _category
        this.description = _description
        this.description2 = _description2
        this.amount = _amount
        this.incomeDate = _date
        this.isRecurring = _isRecurring
    }
}
