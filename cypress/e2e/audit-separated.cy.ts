import { runAxeAudit } from '../support/full-accessibility-report/auditor'

describe('Accessibility Audit: Separated Crawler from Auditor', () => {
    const baseUrl = 'http://localhost:5173'
    let sitemap: { urls: string[] }

    try {
        sitemap = require('../fixtures/sitemap.json')
    } catch (_error) {
        it('Error: Sitemap not found', () => {
            throw new Error('Please execute crawler-separated.cy.ts first!')
        })
        sitemap = { urls: [] }
    }

    const accessibilityErrors: string[] = []

    sitemap.urls.forEach((path) => {
        it(`Check: ${path}`, () => {
            const url = baseUrl + (path.startsWith('/') ? '' : '/') + path
            cy.visit(url)
            runAxeAudit(path, accessibilityErrors)
        })
    })

    it('🏁 ACCESSIBILITY REPORT SUMMARY', () => {
        const totalIssues = accessibilityErrors.length

        cy.log('----------------------------')
        cy.log(`Amount of checked pages: ${sitemap.urls.length}`)
        cy.log(`Total errors found: ${totalIssues}`)
        cy.log('----------------------------')

        if (totalIssues === 0) {
            cy.log(
                '✅ All subpages passed the accessibility audit without any issues!'
            )
        } else {
            accessibilityErrors.forEach((error, index) => {
                cy.log(`❌ ${index + 1}. ${error}`)
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
