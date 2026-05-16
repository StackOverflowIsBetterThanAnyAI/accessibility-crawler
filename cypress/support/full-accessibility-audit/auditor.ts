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
            const rawJson =
                typeof alfaResult.toJSON === 'function'
                    ? alfaResult.toJSON()
                    : alfaResult

            cy.log('Alfa Keys:', Object.keys(alfaResult).join(', '))

            if (rawJson && rawJson.results) {
                cy.log(
                    `Gefundene Ergebnisse im JSON: ${rawJson.results.length}`
                )
                cy.log(
                    'Erstes Result-JSON:',
                    JSON.stringify(rawJson.results[0], null, 2)
                )
            } else if (Array.isArray(rawJson)) {
                cy.log(`Gefundene Ergebnisse im Array-JSON: ${rawJson.length}`)
                cy.log(
                    'Erstes Array-Result-JSON:',
                    JSON.stringify(rawJson[0], null, 2)
                )
            } else {
                cy.log(
                    'Komplettes JSON:',
                    JSON.stringify(rawJson, null, 2).substring(0, 1000)
                )
            }
        })
}
