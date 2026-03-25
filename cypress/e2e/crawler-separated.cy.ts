import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-report/crawler'
import { removeTrailingSlash } from '../support/full-accessibility-report/url-helper'

describe('Crawler: Discovery Phase', () => {
    const baseUrl = 'http://localhost:5173'
    const visitedUrls = new Set<string>()
    const queue: string[] = ['/']

    it('finds all pages and saves them to sitemap.json', () => {
        const processQueue = () => {
            if (!queue.length) {
                cy.writeFile('cypress/fixtures/sitemap.json', {
                    urls: Array.from(visitedUrls),
                    generatedAt: new Date().toISOString(),
                })
                return
            }

            const currentPath = queue.shift()
            if (!currentPath) return

            if (visitedUrls.has(removeTrailingSlash(currentPath))) {
                processQueue()
                return
            }

            visitedUrls.add(removeTrailingSlash(currentPath))
            const fullUrl = currentPath.startsWith('http')
                ? currentPath
                : baseUrl + currentPath

            cy.visit(fullUrl).then(() => {
                getInternalLinks(baseUrl).then((newLinks) => {
                    newLinks.forEach((link) => {
                        const [
                            fullPathAndQuery,
                            isPathPlanned,
                            normalizedPathOnly,
                        ] = getSubPages(baseUrl, link, queue)

                        if (
                            !visitedUrls.has(normalizedPathOnly) &&
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
