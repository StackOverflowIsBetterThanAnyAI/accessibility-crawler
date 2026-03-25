import { runAxeAudit } from '../support/full-accessibility-report/auditor'
import {
    getInternalLinks,
    getSubPages,
} from '../support/full-accessibility-report/crawler'
import { removeTrailingSlash } from '../support/full-accessibility-report/url-helper'

describe('Accessibility Audit: Combined Crawler with Auditor', () => {
    const baseUrl = 'http://localhost:5173'
    const visited = new Set<string>()
    const queue: string[] = ['/']
    const accessibilityErrors: string[] = []

    it('crawls the entire app recursively', () => {
        const processQueue = () => {
            if (!queue.length) {
                printSummary()
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

                    runAxeAudit(currentPath, accessibilityErrors)
                    processQueue()
                })
            })
        }

        const printSummary = () => {
            cy.then(() => {
                cy.log('---------------------------------------')
                cy.log('-- 🏁 ACCESSIBILITY REPORT SUMMARY ---')
                cy.log('---------------------------------------')

                if (accessibilityErrors.length === 0) {
                    cy.log('✅ No accessibility issues found!')
                } else {
                    cy.log(`❌ Found issues: ${accessibilityErrors.length}`)
                    accessibilityErrors.forEach((error) => cy.log(error))
                }
            })
        }

        processQueue()
    })
})
