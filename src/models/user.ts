interface UserData {
    id: number;
    token: string;
    email: string;
    username: string;
    name: string;
    createdAt: string | Date;
}

export class User {
    id: number;
    token: string;
    email: string;
    username: string;
    name: string;
    createdAt: string;

    private constructor(user: UserData){
        this.id = user.id;
        this.token = user.token;
        this.email = user.email;
        this.username = user.username;
        this.name = user.name;
        this.createdAt = user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
    }

    static create(user: UserData): User {
        return new User(user);
    }

    static empty(): User {
        return new User({
            id: 0,
            token: "",
            email: "",
            username: "",
            name: "",
            createdAt: "",
        })
    }
}
