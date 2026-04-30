import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-audit/crawler'
import { removeTrailingSlash } from '../support/full-accessibility-audit/url-helper'

describe('Crawler: Discovery Phase', () => {
    const baseUrl = Cypress.config('baseUrl')
    if (!baseUrl) {
        throw new Error('baseUrl is not defined. Please check your config.')
    }

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
            if (!currentPath) {
                return
            }

            const normalizedPath = removeTrailingSlash(currentPath)

            if (visitedUrls.has(normalizedPath)) {
                processQueue()
                return
            }

            visitedUrls.add(normalizedPath)
            const fullUrl = currentPath.startsWith('http')
                ? currentPath
                : baseUrl + currentPath

            cy.visit(fullUrl).then(() => {
                getInternalLinks(baseUrl).then((newLinks) => {
                    newLinks.forEach((link) => {
                        const [
                            fullPathWithQuery,
                            isPathInQueue,
                            normalizedPath,
                        ] = getSubPages(baseUrl, link, queue)

                        if (
                            !visitedUrls.has(normalizedPath) &&
                            !isPathInQueue
                        ) {
                            queue.push(fullPathWithQuery)
                        }
                    })

                    processQueue()
                })
            })
        }
        processQueue()
    })
})
