import { addLeadingSlash, removeTrailingSlash } from './url-helper'

export const getInternalLinks = (baseUrl: string) => {
    return cy.get('a').then((links: JQuery<HTMLAnchorElement>) => {
        const rawUrls: string[] = links
            .map((_: number, el: HTMLAnchorElement) => el.href)
            .get()

        const baseOrigin = new URL(baseUrl).origin

        const filteredUrls: string[] = rawUrls
            .filter((link) => {
                try {
                    const url = new URL(link)

                    const isInternal = url.origin === baseOrigin
                    const isWebProtocol = url.protocol.startsWith('http')

                    if (!isInternal || !isWebProtocol) return null

                    // remove hash for consistent crawling
                    url.hash = ''

                    // ignore links that point to files
                    const path = url.pathname
                    const lastSegment = path.split('/').pop() || ''
                    if (lastSegment.includes('.')) return null

                    return url.href
                } catch (_error) {
                    return null
                }
            })
            .filter((link): link is string => link !== null)

        return [...new Set(filteredUrls)]
    })
}

export const getSubPages = (baseUrl: string, link: string, queue: string[]) => {
    const urlObj = new URL(link)

    const path = urlObj.pathname
    const fullPathWithQuery = urlObj.pathname + urlObj.search
    const normalizedPath = removeTrailingSlash(path)

    // ignore paths where only query parameters differ
    const isPathInQueue = queue.some((queuedPath) => {
        const queuedUrl = new URL(baseUrl + addLeadingSlash(queuedPath))
        const normalizedQueuedPath = removeTrailingSlash(queuedUrl.pathname)

        return normalizedQueuedPath === normalizedPath
    })

    return [fullPathWithQuery, isPathInQueue, normalizedPath] as const
}
