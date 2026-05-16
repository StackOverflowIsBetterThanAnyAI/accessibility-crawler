import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Audit } from '@siteimprove/alfa-test-utils/audit'
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
        .then((alfaResult: any) => {
            if (!alfaResult) {
                console.warn('No Alfa results found.')
                return
            }

            const jsonRepresentation =
                typeof alfaResult.toJSON === 'function'
                    ? alfaResult.toJSON()
                    : alfaResult

            const rawOutcomes = jsonRepresentation.outcomes || []
            const violationsMap = new Map<string, any>()

            for (const result of rawOutcomes) {
                const outcomeValue =
                    typeof result.outcome === 'object' &&
                    result.outcome !== null
                        ? result.outcome.value || result.outcome.type
                        : result.outcome

                if (outcomeValue === 'failed') {
                    const rule = result.rule
                    if (!rule) {
                        continue
                    }

                    const ruleUri = rule.uri || ''
                    const ruleId = ruleUri
                        ? ruleUri.split('/').pop() || 'alfa-rule'
                        : 'alfa-rule'

                    const ruleDescription =
                        rule.requirement?.title || 'No description available'
                    const ruleRationale =
                        rule.rationale || 'No rationale available'

                    let targetHtml = 'Unknown Element'
                    if (result.target) {
                        targetHtml =
                            result.target.pointer ||
                            result.target.path ||
                            (typeof result.target === 'string'
                                ? result.target
                                : 'HTML Element')
                    }

                    if (!violationsMap.has(ruleId)) {
                        violationsMap.set(ruleId, {
                            id: ruleId,
                            impact: 'serious',
                            description: ruleDescription,
                            help: ruleDescription,
                            helpUrl: ruleUri || 'https://alfa.siteimprove.com/',
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
