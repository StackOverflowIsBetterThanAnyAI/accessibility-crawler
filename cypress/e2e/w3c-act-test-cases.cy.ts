import axe from 'axe-core'
import { runAxeAudit } from '../support/full-accessibility-report/auditor'

describe('System Benchmark: W3C ACT Rules Validation', () => {
    const benchmarkData = require('../fixtures/testcases.json')

    const actToAxeMap: Record<string, string> = {}
    axe.getRules().forEach((rule) => {
        if (rule?.actIds && Array.isArray(rule.actIds)) {
            rule.actIds.forEach((id: string) => {
                actToAxeMap[id] = rule.ruleId
            })
        }
    })

    benchmarkData.testcases.slice(0, 100).forEach((tc: any) => {
        it(`Benchmark ${tc.testcaseTitle}`, () => {
            const errorList: any[] = []

            cy.visit(tc.url)

            runAxeAudit(tc.url, errorList)

            cy.then(() => {
                const targetAxeRuleId = actToAxeMap[tc.ruleId]
                const targetIssueFound = errorList.some(
                    (error) =>
                        error.id === targetAxeRuleId ||
                        error.includes?.(targetAxeRuleId)
                )
                const anyIssueFound = errorList.length > 0

                if (tc.expected === 'failed') {
                    if (targetIssueFound) {
                        cy.log(
                            `Target rule "${targetAxeRuleId}" correctly detected.`
                        )
                    } else if (anyIssueFound) {
                        throw new Error(
                            `ACT Rule "${tc.ruleId}" (Axe: ${targetAxeRuleId}) expected, but other issues found: ${errorList.map((v) => v.id).join(', ')}`
                        )
                    } else {
                        throw new Error(
                            `Target rule "${tc.ruleId}" not detected at all.`
                        )
                    }
                } else if (
                    tc.expected === 'passed' ||
                    tc.expected === 'inapplicable'
                ) {
                    if (!targetIssueFound) {
                        cy.log('No false positive for target rule.')
                        if (anyIssueFound) {
                            cy.log('Other unrelated issues were found.')
                        }
                    } else {
                        throw new Error(
                            `False positive: Rule "${targetAxeRuleId}" triggered.`
                        )
                    }
                }
            })
        })
    })
})
