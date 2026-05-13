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

            alfaResult.resultAggregates.forEach((stats, ruleArg) => {
                if (stats.failed) {
                    const ruleUri =
                        typeof ruleArg === 'string'
                            ? ruleArg
                            : (ruleArg as any).uri

                    const ruleId = ruleUri.split('/').pop() || 'alfa-rule'

                    const description =
                        (ruleArg as any).description ||
                        `Accessibility violation (URI: ${ruleUri})`
                    const rationale =
                        (ruleArg as any).rationale ||
                        'Refer to WCAG guidelines for this rule.'

                    violations.push({
                        id: ruleId,
                        message: `issue on [${currentPath}] - [Alfa]: ${description}\n\nRationale: ${rationale}`,
                    })
                }
            })

            if (violations.length) {
                processViolations(currentPath, violations as any, errorList)
            }
        })
}
