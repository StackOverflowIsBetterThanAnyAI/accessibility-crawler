import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-report/crawler'
import { removeTrailingSlash } from '../support/full-accessibility-report/url-helper'

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
                        const [
                            fullPathAndQuery,
                            isPathPlanned,
                            normalizedPathOnly,
                        ] = getSubPages(baseUrl, link, queue)

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
