import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Rules } from '@siteimprove/alfa-rules'
import { Audit } from '@siteimprove/alfa-act'
import { processViolations } from './auditor-helper'

export const runAlfaAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    cy.document().then(async (doc) => {
        const page = await AlfaCypress.toPage(doc)

        const runner = Audit.of(page, Object.values(Rules))

        const outcomes = await runner.evaluate()

        const violations = [...outcomes]
            .filter((outcome) => outcome.outcome === 'failed')
            .map((outcome) => {
                const failedOutcome = outcome as any
                return {
                    id: failedOutcome.rule.uri,
                    message: `issue on [${currentPath}] - [Alfa]: ${failedOutcome.rule.description}\n\nRationale: ${failedOutcome.rule.rationale}`,
                }
            })

        if (violations.length > 0) {
            processViolations(currentPath, violations as any, errorList)
        }
    })
}
