import { checkManualButtons } from './auditor-checks'
import { processViolations } from './auditor-helper'

export const runAxeAudit = (currentPath: string, errorList: string[]) => {
    cy.injectAxe()

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
        (violations) => {
            processViolations(currentPath, violations, errorList)
        },
        true
    )

    checkManualButtons((manualViolations) => {
        processViolations(currentPath, manualViolations, errorList)
    })
}
