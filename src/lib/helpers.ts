export function isValid(param: string | null | undefined): param is string {
    return typeof param === 'string' && param.trim() !== '';
}
