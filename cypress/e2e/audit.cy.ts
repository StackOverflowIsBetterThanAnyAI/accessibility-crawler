import { runAxeAudit } from '../support/full-accessibility-audit/auditor'
import { ErrorListType } from '../support/full-accessibility-audit/types'
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

    const errorList: ErrorListType[] = []

    sitemap.urls.forEach((path) => {
        it(`Check: ${path}`, () => {
            const url = baseUrl + addLeadingSlash(path)
            cy.visit(url)
            runAxeAudit(path, errorList)
        })
    })

    it('--- Accessibility Audit Summary ---', () => {
        const totalIssues = errorList.length
        const jsonPath = 'cypress/fixtures/full-accessibility-audit.json'
        const mdPath = 'cypress/fixtures/full-accessibility-audit.md'

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

        cy.writeFile(jsonPath, {
            summary: {
                totalCheckedPages: sitemap.urls.length,
                totalIssues: totalIssues,
                timestamp: new Date().toISOString(),
            },
            issues: errorList,
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

            errorList.forEach((error, index) => {
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
                errorList.forEach((error, index) => {
                    cy.log(`${index + 1}. ${error.message}`)
                })

                cy.then(() => {
                    const errorMessage = errorList
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
