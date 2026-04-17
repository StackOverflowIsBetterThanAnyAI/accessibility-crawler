import axe from 'axe-core'
import * as AdditionalChecks from './auditor-checks'
import { processViolations } from './auditor-helper'
import { CustomViolationReturnType } from './types'

export const runAxeAudit = (currentPath: string, errorList: string[]) => {
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

    // custom checks for issues that axe-core doesn't cover
    Object.values(AdditionalChecks).forEach((checkFunction) => {
        if (typeof checkFunction === 'function') {
            checkFunction((violations: CustomViolationReturnType[]) => {
                processViolations(currentPath, violations, errorList)
            })
        }
    })
}
