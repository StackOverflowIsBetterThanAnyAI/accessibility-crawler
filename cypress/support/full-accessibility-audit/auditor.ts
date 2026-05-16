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
        .then((alfaResult: any) => {
            if (!alfaResult) {
                console.warn('No Alfa results found.')
                return
            }

            const violationsMap = new Map<string, any>()

            let resultsArray: any[] = []

            if (typeof alfaResult.toArray === 'function') {
                resultsArray = alfaResult.toArray()
            } else if (
                alfaResult._results &&
                typeof alfaResult._results.toArray === 'function'
            ) {
                resultsArray = alfaResult._results.toArray()
            } else if (typeof alfaResult.toJSON === 'function') {
                const json = alfaResult.toJSON()
                resultsArray = json.results || json || []
            } else {
                cy.log('Alfa-Struktur unbekannt:', Object.keys(alfaResult))
                resultsArray = Array.from(alfaResult)
            }

            for (const result of resultsArray) {
                if (Outcome.isFailed(result) || result.outcome === 'failed') {
                    const rule = result.rule
                    if (!rule) continue

                    const ruleUri = rule.uri || ''
                    const ruleId = ruleUri
                        ? ruleUri.split('/').pop() || 'alfa-rule'
                        : 'alfa-rule'

                    const ruleDescription =
                        rule.requirement?.title ||
                        (rule as any).requirements?.[0]?.title ||
                        'No description available'

                    const ruleRationale =
                        rule.rationale ||
                        (rule as any).rationale ||
                        'No rationale available'

                    let targetHtml = 'Unknown Element'
                    if (result.target) {
                        if (
                            typeof (result.target as any).toString ===
                            'function'
                        ) {
                            targetHtml = (result.target as any).toString()
                        } else if ((result.target as any).html) {
                            targetHtml = (result.target as any).html
                        }
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
