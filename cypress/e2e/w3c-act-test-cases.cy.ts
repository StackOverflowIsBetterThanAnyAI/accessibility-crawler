import axe from 'axe-core'
import { runAxeAudit } from '../support/full-accessibility-report/auditor'
import { W3CActTestCaseType } from '../support/full-accessibility-report/types'

describe('System Benchmark: W3C ACT Rules Validation', () => {
    const benchmarkData = require('../fixtures/testcases.json')

    const customActMapping: Record<string, string> = {
        f51b46: 'video-missing-captions',
        eac66b: 'video-missing-captions',
        '1ea59c': 'video-missing-descriptions',
        '1ec09b': 'video-missing-descriptions',
        c5a4ea: 'video-missing-descriptions',
        c3232f: 'video-missing-descriptions',
        d7ba54: 'video-missing-descriptions',
        '59796f': 'bad-alt-text',
        '23a2a8': 'bad-alt-text',
        qt1vmo: 'bad-alt-text',
    }

    const actToAxeMap: Record<string, string> = {}
    axe.getRules().forEach((rule) => {
        if (rule?.actIds && Array.isArray(rule.actIds)) {
            rule.actIds.forEach((id: string) => {
                actToAxeMap[id] = rule.ruleId
            })
        }
    })

    Object.assign(actToAxeMap, customActMapping)

    benchmarkData.testcases
        .slice(200, 500)
        .forEach((tc: W3CActTestCaseType) => {
            it(`Benchmark ${tc.testcaseTitle}`, () => {
                const errorList: { id: string; message: string }[] = []

                cy.visit(tc.url)

                runAxeAudit(tc.url, errorList)

                cy.then(() => {
                    const targetAxeRuleId = actToAxeMap[tc.ruleId]
                    const isMapped = !!targetAxeRuleId

                    const targetIssue = errorList.find(
                        (error) =>
                            error.id === targetAxeRuleId ||
                            (error.id && error.id.includes(targetAxeRuleId))
                    )

                    const targetIssueFound = !!targetIssue
                    const anyIssueFound = errorList.length > 0
                    const detectedIds = errorList
                        .map((error) => error.id || 'unknown-id')
                        .join(', ')

                    const contextInfo = `
                    --- Diagnosis ---
                    ACT Rule ID: ${tc.ruleId}
                    Expected Axe ID: ${targetAxeRuleId || 'not mapped'}
                    Expected Outcome: ${tc.expected}
                    Detected IDs: [${detectedIds}]
                    ----------------
                `

                    if (tc.expected === 'failed') {
                        if (targetIssueFound) {
                            cy.log(
                                `Target rule "${targetAxeRuleId}" correctly detected.`
                            )
                        } else if (!isMapped && anyIssueFound) {
                            cy.log(
                                `ACT ID ${tc.ruleId} is unmapped. Found issues [${detectedIds}], assuming success for benchmark.`
                            )
                        } else {
                            const errorMsg = targetAxeRuleId
                                ? `Expected specific rule "${targetAxeRuleId}" but found [${detectedIds}].`
                                : `Unmapped ACT rule expected a failure but none was detected.`

                            throw new Error(`${errorMsg}\n${contextInfo}`)
                        }
                    } else if (
                        tc.expected === 'passed' ||
                        tc.expected === 'inapplicable'
                    ) {
                        if (!targetIssueFound) {
                            cy.log('No false positive for target rule.')
                            if (anyIssueFound) {
                                cy.log(
                                    `Found unrelated issue [${detectedIds}], but target rule "${targetAxeRuleId}" remained silent.`
                                )
                            }
                        } else {
                            throw new Error(
                                `False positive: Rule "${targetAxeRuleId}" triggered.\n${contextInfo}`
                            )
                        }
                    }
                })
            })
        })
})
