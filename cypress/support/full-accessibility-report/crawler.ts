import { addLeadingSlash, removeTrailingSlash } from './url-helper'

export const getInternalLinks = (baseUrl: string) => {
    return cy.get('a').then((links: JQuery<HTMLAnchorElement>) => {
        const hrefs = links
            .map((_: number, el: HTMLAnchorElement) => el.href)
            .get()

        const internal = hrefs
            .filter((link) => {
                try {
                    const url = new URL(link)

                    const isInternal = url.origin === new URL(baseUrl).origin
                    const isWebProtocol = url.protocol.startsWith('http')

                    if (!isInternal || !isWebProtocol) return null

                    // remove hash for consistent crawling
                    url.hash = ''
                    const cleanLink = url.href

                    // ignore links that point to files
                    const path = url.pathname
                    const lastSegment = path.split('/').pop() || ''
                    const isNotFile = !lastSegment.includes('.')

                    return isNotFile ? cleanLink : null
                } catch (_error) {
                    return null
                }
            })
            .filter((link): link is string => link !== null)

        return [...new Set(internal)]
    })
}

export const getSubPages = (baseUrl: string, link: string, queue: string[]) => {
    const urlObj = new URL(link)
    const pathOnly = urlObj.pathname
    const fullPathAndQuery = urlObj.pathname + urlObj.search

    const normalizedPathOnly = removeTrailingSlash(pathOnly)

    // ignore paths where only query parameters differ
    const isPathPlanned = queue.some((queuedPath) => {
        const queuedPathOnly = new URL(baseUrl + addLeadingSlash(queuedPath))
            .pathname
        const normalizedQueued = removeTrailingSlash(queuedPathOnly)

        return normalizedQueued === normalizedPathOnly
    })

    return [fullPathAndQuery, isPathPlanned, normalizedPathOnly] as const
}
