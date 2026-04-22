import axe from 'axe-core'
import { runAxeAudit } from '../support/full-accessibility-report/auditor'

describe('System Benchmark: W3C ACT Rules Validation', () => {
    const benchmarkData = require('../fixtures/testcases.json')
    const axeRules = axe.getRules()
    console.log(axeRules)

    benchmarkData.testcases.slice(610, 650).forEach((tc: any) => {
        it(`Benchmark ${tc.testcaseTitle}`, () => {
            const errorList: string[] = []

            cy.visit(tc.url)

            runAxeAudit(tc.url, errorList)

            console.log(tc.ruleId)

            cy.then(() => {
                const foundAnyIssue = errorList.length > 0

                if (tc.expected === 'failed') {
                    if (foundAnyIssue) {
                        cy.log('Issue found.')
                    } else {
                        throw new Error(
                            `Error "${tc.ruleName}" expected, but not found: ${tc.testcaseTitle}`
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
                            `False positive: Tested for rule\n"${tc.ruleName}", and found:\n${errorList.join('\n')}`
                        )
                    }
                }
            })
        })
    })
})
