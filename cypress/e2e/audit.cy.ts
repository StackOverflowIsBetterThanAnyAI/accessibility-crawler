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

    it('--- Accessibility Audit Summary ---', () => {
        const totalIssues = accessibilityErrors.length
        const jsonPath = 'cypress/fixtures/full-accessibility-audit.json'
        const mdPath = 'cypress/fixtures/full-accessibility-audit.md'

        cy.log('----------------------------')
        cy.log(`Amount of checked pages: ${sitemap.urls.length}`)
        cy.log(`Total issues found: ${totalIssues}`)
        cy.log('----------------------------')

        cy.writeFile(jsonPath, {
            summary: {
                totalCheckedPages: sitemap.urls.length,
                totalIssues: totalIssues,
                timestamp: new Date().toISOString(),
            },
            issues: accessibilityErrors,
        })

        let mdContent = `# Full Accessibility Audit \n\n`
        mdContent += `> - **Total issues found:** ${totalIssues}\n`
        mdContent += `> - **Amount of checked pages:** ${sitemap.urls.length}\n`
        mdContent += `> - **Timestamp:** ${new Date().toLocaleString('de-DE')}\n\n---\n\n`

        if (!totalIssues) {
            mdContent +=
                `## No issues found!\n` +
                `All checked subpages passed the accessibility audit without any issues.\n` +
                `Keep in mind that there may be other accessibility issues not covered by this audit.`
        } else {
            mdContent += `## Found ${totalIssues} issues\n\n`

            accessibilityErrors.forEach((error, index) => {
                const formattedMessage = error.message
                    .replace('Element: ', '\n**Element:**\n```html\n')
                    .replace(
                        'Fix all of the following:',
                        '```\n\n**Fix all of the following:**'
                    )
                    .replace('Help: ', '\n**Help:** ')

                mdContent += `### ${index + 1}. [${error.id}]\n${formattedMessage}\n\n---\n`
            })
        }

        cy.writeFile(mdPath, mdContent)

        cy.then(() => {
            if (!totalIssues) {
                cy.log(
                    'All checked subpages passed the accessibility audit without any issues.'
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
})
