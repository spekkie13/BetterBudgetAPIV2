export interface IResponse<T> {
    data: T;
    status: number;
    message: string;
    error?: string;
    success?: boolean;
}

export class Response<T> implements IResponse<T> {
    data: T
    status: number
    message: string
    error?: string
    success?: boolean

    constructor(data: IResponse<T>) {
        this.data = data.data;
        this.error = data.error;
        this.status = data.status;
        this.success = data.success;
        this.message = data.message;
    }
}
