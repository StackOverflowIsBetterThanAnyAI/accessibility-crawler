import { Cypress as AlfaCypress } from '@siteimprove/alfa-cypress'
import { Rules } from '@siteimprove/alfa-rules'
import { Audit } from '@siteimprove/alfa-act' // WICHTIG: Hier steckt die Logik
import { processViolations } from './auditor-helper'

export const runAlfaAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    cy.document().then(async (doc) => {
        // 1. Dokument in Alfa-Page konvertieren
        const page = await AlfaCypress.toPage(doc)

        // 2. Das Audit-Objekt erstellen (Page + Regeln)
        const runner = Audit.of(page, Object.values(Rules))

        // 3. Audit ausführen (asynchron)
        const outcomes = await runner.evaluate()

        // 4. Ergebnisse filtern (Alfa nutzt "failed" für Verstöße)
        const violations = [...outcomes]
            .filter((outcome) => outcome.outcome === 'failed')
            .map((outcome) => {
                // Wir müssen das "Failed"-Outcome casten, um Zugriff auf die Rule zu haben
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
