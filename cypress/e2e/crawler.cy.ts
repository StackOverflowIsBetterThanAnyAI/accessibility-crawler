import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-audit/crawler'
import { removeTrailingSlash } from '../support/full-accessibility-audit/url-helper'

describe('Crawler: Discovery Phase', () => {
    const baseUrl = Cypress.config('baseUrl')
    const sitemapPath = 'cypress/fixtures/sitemap.json'

    if (!baseUrl) {
        throw new Error('baseUrl is not defined. Please check your config.')
    }

    let sitemapConfig = {
        included: [] as string[],
        excluded: [] as string[],
    }

    const visitedUrls = new Set<string>()
    const auditUrls = new Set<string>()
    const queue: string[] = ['/']

    const convertToRegex = (pattern: string) => {
        let regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
        regexStr = regexStr.replace(/\*/g, '.*')
        return new RegExp(`^${regexStr}$`)
    }

    const isPathAllowedForAudit = (path: string): boolean => {
        const { excluded } = sitemapConfig
        const normalized = removeTrailingSlash(path)

        return !excluded.some((pattern) =>
            convertToRegex(pattern).test(normalized)
        )
    }

    it('crawls all pages but filters sitemap.json based on config', () => {
        cy.exec('cmd /c if exist "' + sitemapPath + '" echo exists', {
            failOnNonZeroExit: false,
        }).then((result) => {
            if (result.stdout.trim() === 'exists') {
                cy.readFile(sitemapPath).then((existingSitemap) => {
                    if (existingSitemap && existingSitemap.config) {
                        sitemapConfig = existingSitemap.config

                        cy.log(
                            'Existing config loaded:',

                            JSON.stringify(sitemapConfig)
                        )
                    }
                })
            } else {
                cy.log('No existing sitemap found. Generating empty config.')
            }
        })

        const processQueue = () => {
            if (!queue.length) {
                cy.writeFile(sitemapPath, {
                    config: sitemapConfig,
                    urls: Array.from(auditUrls),
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

            if (isPathAllowedForAudit(normalizedPath)) {
                auditUrls.add(normalizedPath)
            }

            const fullUrl = currentPath.startsWith('http')
                ? currentPath
                : baseUrl + currentPath

            cy.visit(fullUrl).then(() => {
                getInternalLinks(baseUrl).then((newLinks) => {
                    newLinks.forEach((link) => {
                        const [
                            fullPathWithQuery,
                            isPathInQueue,
                            nextNormalizedPath,
                        ] = getSubPages(baseUrl, link, queue)

                        if (
                            !visitedUrls.has(nextNormalizedPath) &&
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
