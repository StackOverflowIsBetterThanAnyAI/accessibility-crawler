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
            if (!alfaResult?.resultAggregates) {
                console.warn('No aggregates found.')
                return
            }

            const violationsForProcess: any[] = []

            alfaResult.resultAggregates.forEach((stats, ruleArg) => {
                if (stats.failed > 0) {
                    const rule = ruleArg as any
                    violationsForProcess.push({
                        id: rule.uri.split('/').pop() || 'alfa-rule',
                        impact: 'serious',
                        description: rule.description,
                        help: rule.description,
                        helpUrl: rule.uri,
                        tags: [],
                        nodes: [
                            {
                                html: 'Target element details',
                                failureSummary: rule.rationale,
                            },
                        ],
                    })
                }
            })

            if (violationsForProcess.length > 0) {
                processViolations(currentPath, violationsForProcess, errorList)
            }
        })
}
