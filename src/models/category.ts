export class Category implements ICategory{
  id: number
  name: string
  color: string
  icon: string
  userId: number

  constructor(data: ICategory) {
    this.id = data.id
    this.name = data.name
    this.color = data.color
    this.icon = data.icon
    this.userId = data.userId
  }

  toString() {
    return `Category - Id: ${this.id}, name: ${this.name}, color: ${this.color}, icon: ${this.icon}, user ID: ${this.userId}`
  }
}

interface ICategory{
  id: number,
  name: string,
  color: string,
  icon: string,
  userId: number
}
