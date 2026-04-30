export const addLeadingSlash = (path: string): string => {
    return path.startsWith('/') ? path : `/${path}`
}

export const removeTrailingSlash = (path: string): string => {
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}
