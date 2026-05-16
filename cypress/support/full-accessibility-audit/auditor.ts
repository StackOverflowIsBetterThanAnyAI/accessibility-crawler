import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Audit } from '@siteimprove/alfa-test-utils/audit'
import { Outcome } from '@siteimprove/alfa-act'
import { processViolations } from './auditor-helper'
import { waitForNetworkIdle } from './wait-for-network-idle'

export const runAlfaAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    waitForNetworkIdle()

    cy.document()
        .then(AlfaCypress.toPage)
        .then(async (page) => {
            return await Audit.run(page)
        })
        .then((alfaResult) => {
            if (!alfaResult) {
                console.warn('No Alfa results found.')
                return
            }

            const violationsMap = new Map<string, any>()

            const resultsArray = Array.isArray(alfaResult)
                ? alfaResult
                : (alfaResult as any).results || Array.from(alfaResult as any)

            for (const result of resultsArray) {
                if (Outcome.isFailed(result)) {
                    const rule = result.rule

                    const ruleUri = rule.uri
                    const ruleId = ruleUri
                        ? ruleUri.split('/').pop() || 'alfa-rule'
                        : 'alfa-rule'

                    const ruleDescription =
                        (rule as any).requirements?.[0]?.title ||
                        'No description available'
                    const ruleRationale =
                        (rule as any).rationale || 'No rationale available'

                    let targetHtml = 'Unknown Element'
                    if (
                        result.target &&
                        typeof (result.target as any).toString === 'function'
                    ) {
                        targetHtml = (result.target as any).toString()
                    }

                    if (!violationsMap.has(ruleId)) {
                        violationsMap.set(ruleId, {
                            id: ruleId,
                            impact: 'serious',
                            description: ruleDescription,
                            help: ruleDescription,
                            helpUrl: ruleUri || '',
                            tags: [],
                            nodes: [],
                        })
                    }

                    violationsMap.get(ruleId).nodes.push({
                        html: targetHtml,
                        failureSummary: ruleRationale,
                    })
                }
            }

            const violationsForProcess = Array.from(violationsMap.values())

            if (violationsForProcess.length) {
                processViolations(currentPath, violationsForProcess, errorList)
            }
        })
}
