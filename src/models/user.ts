export class User {
    id: number;
    uuid: string;
    email: string;
    username: string;
    name: string;
    createdAt: string;

    private constructor(user: any){
        this.id = user.id;
        this.uuid = user.uuid;
        this.email = user.email;
        this.username = user.username;
        this.name = user.name;
        this.createdAt = user.createdAt;
    }

    static create(user: any) {
        return new User(user);
    }

    static empty() {
        return new User({
            id: 0,
            uuid: "",
            email: "",
            username: "",
            name: "",
            createdAt: "",
        })
    }

    static isEmpty(user: User) {
        return user === User.empty();
    }
}
