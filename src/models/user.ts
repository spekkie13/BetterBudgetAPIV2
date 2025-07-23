export class User implements IUser {
    id: number
    name: string
    username: string
    email: string
    teamId: number

    constructor(data : IUser){
        this.id = data.id
        this.name = data.name
        this.username = data.username
        this.email = data.email
        this.teamId = data.teamId
    }
}

interface IUser {
    id: number
    name: string
    username: string
    email: string
    teamId: number
}
