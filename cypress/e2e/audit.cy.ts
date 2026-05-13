import { runAlfaAudit } from '../support/full-accessibility-audit/auditor'
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
            sitemap = { urls: [] }
        }
    } catch {
        sitemap = { urls: [] }
    }

    const accessibilityErrors: { id: string; message: string }[] = []

    sitemap.urls.forEach((path) => {
        it(`Alfa Check: ${path}`, () => {
            const url = baseUrl + addLeadingSlash(path)
            cy.visit(url)
            // Hier wird nun die Alfa-Engine gezündet
            runAlfaAudit(path, accessibilityErrors)
        })
    })

    it('--- Accessibility Audit Summary ---', () => {
        const totalIssues = accessibilityErrors.length
        const reportPath = 'cypress/fixtures/full-accessibility-audit.json'

        if (!sitemap.urls.length) {
            cy.log('----------------------------')
            cy.log('No pages found in sitemap.')
            cy.log(
                'Please ensure that the crawler has generated the sitemap.json file.'
            )
            cy.log(
                'If you have already run the crawler and the sitemap.json file is present, please check its contents to ensure it has the expected structure.'
            )
            cy.log('----------------------------')
            return
        }

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
