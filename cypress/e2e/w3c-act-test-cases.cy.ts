import { runAxeAudit } from '../support/full-accessibility-report/auditor'

describe('System Benchmark: W3C ACT Rules Validation', () => {
    const benchmarkData = require('../fixtures/testcases.json')

    benchmarkData.testcases.slice(0, 25).forEach((tc: any) => {
        it(`Benchmark ${tc.testcaseTitle}`, () => {
            const currentErrors: string[] = []

            cy.visit(tc.url)

            runAxeAudit(tc.url, currentErrors)

            cy.then(() => {
                const foundAnyIssue = currentErrors.length > 0

                if (tc.expected === 'failed') {
                    if (foundAnyIssue) {
                        cy.log('Issue found.')
                    } else {
                        throw new Error(
                            `Error expected, but not found: ${tc.testcaseTitle}`
                        )
                    }
                } else if (
                    tc.expected === 'passed' ||
                    tc.expected === 'inapplicable'
                ) {
                    if (!foundAnyIssue) {
                        cy.log('No false positive triggered.')
                    } else {
                        throw new Error(
                            `False positive: Tested for rule\n"${tc.ruleName}", and found:\n${currentErrors.join('\n')}`
                        )
                    }
                }
            })
        })
    })
})
