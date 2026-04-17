import { runAxeAudit } from '../support/full-accessibility-report/auditor'
import { addLeadingSlash } from '../support/full-accessibility-report/url-helper'

describe('Accessibility Audit: Separated Crawler from Auditor', () => {
    const baseUrl = Cypress.config('baseUrl')
    if (!baseUrl) {
        throw new Error('baseUrl is not defined. Please check your config.')
    }

    let sitemap: { urls: string[] }

    try {
        sitemap = require('../fixtures/sitemap.json')
        if (sitemap.urls.length === 0) {
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

    const accessibilityErrors: string[] = []

    sitemap.urls.forEach((path) => {
        it(`Check: ${path}`, () => {
            const url = baseUrl + addLeadingSlash(path)
            cy.visit(url)
            runAxeAudit(path, accessibilityErrors)
        })
    })

    it('--- Accessibility Report Summary ---', () => {
        const totalIssues = accessibilityErrors.length

        cy.log('----------------------------')
        cy.log(`Amount of checked pages: ${sitemap.urls.length}`)
        cy.log(`Total issues found: ${totalIssues}`)
        cy.log('----------------------------')

        if (totalIssues === 0) {
            cy.log(
                'All subpages passed the accessibility audit without any issues.'
            )
            cy.log(
                'Keep in mind that there may be other accessibility issues not covered by this audit.'
            )
        } else {
            accessibilityErrors.forEach((error, index) => {
                cy.log(`${index + 1}. ${error}`)
            })

            cy.then(() => {
                const errorMessage = accessibilityErrors.join(
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
