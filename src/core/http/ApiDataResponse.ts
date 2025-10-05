export type ApiDataResponse<T> = {
    data: T
    error?: string
    status?: number
    success?: boolean
    message?: string
}
