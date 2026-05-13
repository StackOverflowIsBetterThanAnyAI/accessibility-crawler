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
                    // Sicherheit: Prüfen, ob ruleArg ein String oder Objekt ist
                    const ruleUri =
                        typeof ruleArg === 'string'
                            ? ruleArg
                            : (ruleArg as any).uri || ''
                    const ruleDescription =
                        (ruleArg as any).description ||
                        'No description available'
                    const ruleRationale =
                        (ruleArg as any).rationale || 'No rationale available'

                    // Falls ruleUri leer ist, Fallback nutzen
                    const ruleId = ruleUri
                        ? ruleUri.split('/').pop()
                        : 'alfa-rule'

                    violationsForProcess.push({
                        id: ruleId,
                        impact: 'serious', // Alfa Mapping: failed -> serious
                        description: ruleDescription,
                        help: ruleDescription,
                        helpUrl: ruleUri || 'https://alfa.siteimprove.com/',
                        tags: [], // Alfa Tags weichen von Axe Tags ab
                        nodes: [
                            {
                                html: 'Target element details (see Alfa report for specifics)',
                                failureSummary: ruleRationale,
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
