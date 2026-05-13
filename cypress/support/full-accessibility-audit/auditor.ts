import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import * as Rules from '@siteimprove/alfa-rules'
import { Audit } from '@siteimprove/alfa-act'
import { Rule } from '@siteimprove/alfa-act'
import { processViolations } from './auditor-helper'

export const runAlfaAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    cy.document().then(async (doc) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const page = await AlfaCypress.toPage(doc)

        const allRules = Object.values(Rules).filter(
            (rule) =>
                rule !== null && typeof rule === 'object' && 'evaluate' in rule
        )

        const runner = Audit.of(
            page,
            allRules as unknown as Iterable<Rule<any, any, any, any>>
        )

        const outcomes = await runner.evaluate()

        const violations = [...outcomes]
            .filter((outcome) => outcome.outcome === 'failed')
            .map((outcome) => {
                const failedOutcome = outcome as any
                return {
                    id: failedOutcome.rule.uri || 'alfa-rule',
                    message: `issue on [${currentPath}] - [Alfa]: ${failedOutcome.rule.description}\n\nRationale: ${failedOutcome.rule.rationale}`,
                }
            })

        console.log(`Alfa Outcomes: Total: ${[...outcomes].length}`)
        console.log(
            `Passed: ${[...outcomes].filter((o) => o.outcome === 'passed').length}`
        )

        if (violations.length) {
            processViolations(currentPath, violations as any, errorList)
        }
    })
}
