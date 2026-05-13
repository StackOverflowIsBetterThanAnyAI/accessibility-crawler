import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Audit } from '@siteimprove/alfa-test-utils/audit'
import { processViolations } from './auditor-helper'

export const runAlfaAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    cy.document()
        .then(AlfaCypress.toPage)
        .then(async (page) => {
            return await Audit.run(page)
        })
        .then((alfaResult) => {
            const violations: { id: string; message: string }[] = []

            if (!alfaResult?.resultAggregates) {
                console.warn(
                    'Alfa hat keine Ergebnisse (Aggregates) geliefert.'
                )
                return
            }

            alfaResult.resultAggregates.forEach((stats, ruleArg) => {
                if (stats?.failed > 0) {
                    const rule = ruleArg as any

                    const ruleUri =
                        typeof rule === 'string'
                            ? rule
                            : (rule?.uri ?? 'alfa/unknown')
                    const ruleId = ruleUri.split('/').pop() ?? 'alfa-rule'
                    const description =
                        rule?.description ?? `Violation of rule ${ruleId}`
                    const rationale =
                        rule?.rationale ?? 'No rationale provided by Alfa.'

                    violations.push({
                        id: ruleId,
                        message: `issue on [${currentPath}] - [Alfa]: ${description}\n\nRationale: ${rationale}`,
                    })
                }
            })

            console.log(
                `Alfa Audit für ${currentPath}: ${violations.length} Fehler gefunden.`
            )

            if (violations.length > 0) {
                processViolations(currentPath, violations as any, errorList)
            }
        })
}
