import axe from 'axe-core'
import { processViolations } from './auditor-helper'

export const runAxeAudit = (
    currentPath: string,
    errorList: { id: string; message: string }[]
) => {
    cy.injectAxe()

    // axe-core checks
    cy.checkA11y(
        undefined,
        {
            runOnly: {
                type: 'tag',
                values: [
                    'wcag2a',
                    'wcag2aa',
                    'wcag21a',
                    'wcag21aa',
                    'wcag22aa',
                ],
            },
            includedImpacts: ['critical', 'serious', 'moderate'],
        },
        (violations: axe.Result[]) => {
            processViolations(currentPath, violations, errorList)
        },
        true
    )
}
