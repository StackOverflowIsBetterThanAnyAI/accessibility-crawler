import { getInternalLinks } from '../support/full-accessibility-report/crawler'
import {
    addLeadingSlash,
    removeTrailingSlash,
} from '../support/full-accessibility-report/url-helper'

describe('Crawler: Discovery Phase', () => {
    const baseUrl = 'http://localhost:5173'
    const visited = new Set<string>()
    const queue: string[] = ['/']

    it('finds all pages and saves them to sitemap.json', () => {
        const processQueue = () => {
            if (!queue.length) {
                cy.writeFile('cypress/fixtures/sitemap.json', {
                    urls: Array.from(visited),
                    generatedAt: new Date().toISOString(),
                })
                return
            }

            const currentPath = queue.shift()
            if (!currentPath) return

            if (visited.has(removeTrailingSlash(currentPath))) {
                processQueue()
                return
            }

            visited.add(removeTrailingSlash(currentPath))
            const fullUrl = currentPath.startsWith('http')
                ? currentPath
                : baseUrl + currentPath

            cy.visit(fullUrl).then(() => {
                getInternalLinks(baseUrl).then((newLinks) => {
                    newLinks.forEach((link) => {
                        const urlObj = new URL(link)
                        const pathOnly = urlObj.pathname
                        const fullPathAndQuery = urlObj.pathname + urlObj.search

                        const normalizedPathOnly = removeTrailingSlash(pathOnly)

                        // ignore paths where only query parameters differ
                        const isPathPlanned = queue.some((queuedPath) => {
                            const queuedPathOnly = new URL(
                                baseUrl + addLeadingSlash(queuedPath)
                            ).pathname
                            const normalizedQueued =
                                removeTrailingSlash(queuedPathOnly)

                            return normalizedQueued === normalizedPathOnly
                        })

                        if (
                            !visited.has(normalizedPathOnly) &&
                            !isPathPlanned
                        ) {
                            queue.push(fullPathAndQuery)
                        }
                    })

                    processQueue()
                })
            })
        }
        processQueue()
    })
})
