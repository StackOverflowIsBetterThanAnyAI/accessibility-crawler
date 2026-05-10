import { runAxeAudit } from '../support/full-accessibility-audit/auditor'
import { addLeadingSlash } from '../support/full-accessibility-audit/url-helper'

describe('Accessibility Audit: Separated Crawler from Auditor', () => {
    const baseUrl = Cypress.config('baseUrl')
    if (!baseUrl) {
        throw new Error('baseUrl is not defined. Please check your config.')
    }

    let sitemap: { urls: string[] }

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        sitemap = require('../fixtures/sitemap.json')
        if (!sitemap.urls.length) {
            it('Error: Sitemap is empty', () => {
                throw new Error('Please execute crawler-separated.cy.ts!')
            })
        }
    } catch {
        it('Error: Sitemap not found', () => {
            throw new Error('Please execute crawler-separated.cy.ts first!')
        })
        sitemap = { urls: [] }
    }

    const accessibilityErrors: { id: string; message: string }[] = []

    sitemap.urls.forEach((path) => {
        it(`Check: ${path}`, () => {
            const url = baseUrl + addLeadingSlash(path)
            cy.visit(url)
            runAxeAudit(path, accessibilityErrors)
        })
    })

    it('--- Accessibility Report Summary ---', () => {
        const totalIssues = accessibilityErrors.length
        const reportPath = 'cypress/fixtures/full-accessibility-audit.json'

        cy.log('----------------------------')
        cy.log(`Amount of checked pages: ${sitemap.urls.length}`)
        cy.log(`Total issues found: ${totalIssues}`)
        cy.log('----------------------------')

        cy.writeFile(reportPath, {
            summary: {
                totalCheckedPages: sitemap.urls.length,
                totalIssues: totalIssues,
                timestamp: new Date().toISOString(),
            },
            issues: accessibilityErrors,
        })

        if (!totalIssues) {
            cy.log(
                'All subpages passed the accessibility audit without any issues.'
            )
            cy.log(
                'Keep in mind that there may be other accessibility issues not covered by this audit.'
            )
        } else {
            accessibilityErrors.forEach((error, index) => {
                cy.log(`${index + 1}. ${error.message}`)
            })

            cy.then(() => {
                const errorMessage = accessibilityErrors
                    .map((err) => err.message)
                    .join(
                        '\n\n--------------------------------------------------------\n\n'
                    )
                expect(
                    totalIssues,
                    `Found ${totalIssues} issues:\n${errorMessage}\n\n`
                ).to.equal(0)
            })
        }
    })
})
