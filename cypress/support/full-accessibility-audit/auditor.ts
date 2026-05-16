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

            if (
                alfaResult._results &&
                typeof alfaResult._results.toArray === 'function'
            ) {
                resultsArray = alfaResult._results.toArray()
            } else if (typeof alfaResult.toArray === 'function') {
                resultsArray = alfaResult.toArray()
            } else if (
                alfaResult.results &&
                typeof alfaResult.results.toArray === 'function'
            ) {
                resultsArray = alfaResult.results.toArray()
            } else {
                const json =
                    typeof alfaResult.toJSON === 'function'
                        ? alfaResult.toJSON()
                        : alfaResult
                resultsArray = json.results || (Array.isArray(json) ? json : [])
            }

            if (!Array.isArray(resultsArray)) {
                cy.log(
                    'Alfa-Audit-Fehler: Ergebnisse konnten nicht in ein Array konvertiert werden.',
                    resultsArray
                )
                return
            }

            for (const result of resultsArray) {
                const isFailed =
                    Outcome.isFailed(result) ||
                    result.outcome === 'failed' ||
                    result._outcome === 'failed'

                if (isFailed) {
                    const rule = result.rule || (result as any)._rule
                    if (!rule) continue

                    const ruleUri = rule.uri || (rule as any)._uri || ''
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
                        const target = result.target
                        if (
                            typeof target.toString === 'function' &&
                            target.toString() !== '[object Object]'
                        ) {
                            targetHtml = target.toString()
                        } else if (target.html) {
                            targetHtml = target.html
                        } else if (target._html) {
                            targetHtml = target._html
                        } else if (typeof target.toJSON === 'function') {
                            const targetJson = target.toJSON()
                            targetHtml =
                                targetJson.html ||
                                targetJson.tagName ||
                                'HTML Element'
                        }
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
