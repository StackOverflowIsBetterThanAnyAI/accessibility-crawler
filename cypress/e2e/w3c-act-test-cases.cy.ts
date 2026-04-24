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
        '23a2a8': 'bad-alt-image',
        qt1vmo: 'bad-alt-image',
        '59796f': 'bad-alt-input-image',
        '46ca7f': 'conflict-decorative-role',
    }

    const actToAxeMap: Record<string, string[]> = {}

    axe.getRules().forEach((rule) => {
        if (rule?.actIds && Array.isArray(rule.actIds)) {
            rule.actIds.forEach((id: string) => {
                if (!actToAxeMap[id]) actToAxeMap[id] = []
                actToAxeMap[id].push(rule.ruleId)
            })
        }
    })

    Object.entries(customActMapping).forEach(([actId, axeIds]) => {
        if (!actToAxeMap[actId]) actToAxeMap[actId] = []

        if (Array.isArray(axeIds)) {
            actToAxeMap[actId].push(...axeIds)
        } else {
            actToAxeMap[actId].push(axeIds)
        }
    })

    benchmarkData.testcases
        .slice(0, 200)
        .filter((tc: W3CActTestCaseType) => tc.ruleId === '46ca7f')
        .forEach((tc: W3CActTestCaseType) => {
            it(`Benchmark ${tc.testcaseTitle}`, () => {
                const errorList: { id: string; message: string }[] = []

                cy.visit(tc.url)

                runAxeAudit(tc.url, errorList)

                cy.then(() => {
                    const targetAxeRuleIds = actToAxeMap[tc.ruleId] || []
                    const isMapped = targetAxeRuleIds.length > 0

                    const targetIssue = errorList.find((error) =>
                        targetAxeRuleIds.some(
                            (id) =>
                                error.id === id ||
                                (error.id && error.id.includes(id))
                        )
                    )

                    const targetIssueFound = !!targetIssue
                    const anyIssueFound = errorList.length > 0
                    const detectedIds = errorList
                        .map((error) => error.id || 'unknown-id')
                        .join(', ')

                    const contextInfo = `
                    --- Diagnosis ---
                    ACT Rule ID: ${tc.ruleId}
                    Expected Axe ID: ${targetAxeRuleIds.join(', ') || 'not mapped'}
                    Expected Outcome: ${tc.expected}
                    Detected IDs: [${detectedIds}]
                    ----------------
                `

                    if (tc.expected === 'failed') {
                        if (targetIssueFound) {
                            cy.log(
                                `Target rule "${targetAxeRuleIds.join(', ')}" correctly detected.`
                            )
                        } else if (!isMapped && anyIssueFound) {
                            cy.log(
                                `ACT ID ${tc.ruleId} is unmapped. Found issues [${detectedIds}], assuming success for benchmark.`
                            )
                        } else {
                            const errorMsg =
                                targetAxeRuleIds.length > 0
                                    ? `Expected specific rule "${targetAxeRuleIds.join(', ')}" but found [${detectedIds}].`
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
                                    `Found unrelated issue [${detectedIds}], but target rule "${targetAxeRuleIds.join(', ')}" remained silent.`
                                )
                            }
                        } else {
                            throw new Error(
                                `False positive: Rule "${targetAxeRuleIds.join(', ')}" triggered.\n${contextInfo}`
                            )
                        }
                    }
                })
            })
        })
})
