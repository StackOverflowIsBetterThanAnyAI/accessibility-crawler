import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-audit/crawler'
import {
    addLeadingSlash,
    removeTrailingSlash,
} from '../support/full-accessibility-audit/url-helper'

describe('Crawler: Discovery Phase', () => {
    const baseUrl = Cypress.config('baseUrl')
    const sitemapPath = 'cypress/fixtures/sitemap.json'

    if (!baseUrl) {
        throw new Error('baseUrl is not defined. Please check your config.')
    }

    let sitemapConfig = {
        only: [] as string[],
        included: [] as string[],
        excluded: [] as string[],
    }
    let globalStorageData: any = null

    const visitedUrls = new Set<string>()
    const auditUrls = new Set<string>()
    const queue: string[] = ['/']

    const convertToRegex = (pattern: string) => {
        let regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
        regexStr = regexStr.replace(/\*/g, '.*')
        return new RegExp(`^${regexStr}$`, 'i')
    }

    const isPathAllowedForAudit = (path: string): boolean => {
        const { excluded } = sitemapConfig
        const normalized = removeTrailingSlash(path.trim())

        return !excluded.some((pattern) =>
            convertToRegex(cleanUpExistingPattern(pattern)).test(normalized)
        )
    }

    const cleanUpExistingPattern = (pattern: string) => {
        return (
            removeTrailingSlash(
                addLeadingSlash(pattern.replace(/^\*|\*$/g, '').trim())
            ) || '/'
        )
    }

    it('crawls all pages but filters sitemap.json based on config', () => {
        cy.task<boolean>('checkIfFileExists', sitemapPath).then((exists) => {
            if (exists) {
                cy.readFile(sitemapPath).then((existingSitemap) => {
                    if (existingSitemap && existingSitemap.config) {
                        sitemapConfig = existingSitemap.config
                        globalStorageData =
                            existingSitemap.globalStorage || null
                    }
                })
            }
        })

        cy.then(() => {
            if (sitemapConfig.only && sitemapConfig.only.length) {
                const fixedUrls = sitemapConfig.only.map((item) =>
                    cleanUpExistingPattern(item)
                )

                cy.writeFile(sitemapPath, {
                    config: sitemapConfig,
                    globalStorage: globalStorageData,
                    urls: fixedUrls,
                    generatedAt: new Date().toISOString(),
                })
                return
            }
            if (sitemapConfig.included && sitemapConfig.included.length) {
                sitemapConfig.included.forEach((item) => {
                    const normalizedInclude = cleanUpExistingPattern(item)
                    if (isPathAllowedForAudit(normalizedInclude)) {
                        auditUrls.add(normalizedInclude)
                    }
                })
            }

            const processQueue = () => {
                if (!queue.length) {
                    cy.writeFile(sitemapPath, {
                        config: sitemapConfig,
                        globalStorage: globalStorageData,
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
                    cy.then(processQueue)
                    return
                }

                visitedUrls.add(normalizedPath)

                if (isPathAllowedForAudit(normalizedPath)) {
                    auditUrls.add(normalizedPath)
                }

                const fullUrl = currentPath.startsWith('http')
                    ? currentPath
                    : baseUrl + currentPath

                cy.visit(fullUrl)

                getInternalLinks(baseUrl)
                    .then((newLinks) => {
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
                    })
                    .then(() => {
                        cy.then(processQueue)
                    })
            }
            processQueue()
        })
    })
})
