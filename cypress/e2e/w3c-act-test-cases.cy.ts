import axe from 'axe-core'
import { runAxeAudit } from '../support/full-accessibility-report/auditor'
import { W3CActTestCaseType } from '../support/full-accessibility-report/types'

describe('System Benchmark: W3C ACT Rules Validation', () => {
    const benchmarkData = require('../fixtures/testcases.json')

    // axe checks
    //  18:38     1173 tests      946 passing      227 failing

    // custom checks
    //  24:02     1173 tests      963 passing      210 failing

    const customActMapping: Record<string, string> = {
        '23a2a8': 'bad-alt-image',
        qt1vmo: 'bad-alt-image',
        '59796f': 'bad-alt-input-image',
        '46ca7f': 'conflict-decorative-role',
        bisz58: 'meta-refresh-delay',
        ffd0e9: 'non-empty-heading',
        '2t702h': 'details-summary-name',
        kb1m8s: 'prohibited-aria-naming',
        off6ek: 'language-mismatch',
        ucwvc8: 'primary-language-mismatch',
        b4f0c3: 'meta-valid-viewport',
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
        // .slice(900, 1000) // next up
        .filter((tc: W3CActTestCaseType) => tc.ruleId === 'b4f0c3')
        // .slice(7, 11)
        .forEach((tc: W3CActTestCaseType) => {
            it(`Benchmark ${tc.testcaseTitle}`, () => {
                const errorList: { id: string; message: string }[] = []

                cy.visit(tc.url)

                runAxeAudit(tc.url, errorList)

                cy.then(() => {
                    const targetAxeRuleIds = actToAxeMap[tc.ruleId] || []

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
                        } else {
                            const errorMsg =
                                targetAxeRuleIds.length > 0
                                    ? `Expected specific rule "${targetAxeRuleIds.join(', ')}" but only found [${detectedIds}].`
                                    : `ACT rule expected a failure but none was detected.`

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
