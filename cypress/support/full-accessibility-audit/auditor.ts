import axe from 'axe-core'
import * as BodyChecks from './auditor-checks-body'
import * as HeadChecks from './auditor-checks-head'
import * as HtmlChecks from './auditor-checks-html'
import { processViolations } from './auditor-helper'
import { CustomViolationReturnType } from './types'

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

    cy.get('body').then(($body) => {
        Object.values(BodyChecks).forEach((checkFunction) => {
            if (typeof checkFunction === 'function') {
                checkFunction(
                    $body,
                    (violations: CustomViolationReturnType[]) =>
                        processViolations(currentPath, violations, errorList)
                )
            }
        })
    })

    cy.get('head').then(($head) => {
        Object.values(HeadChecks).forEach((checkFunction) => {
            if (typeof checkFunction === 'function') {
                checkFunction(
                    $head,
                    (violations: CustomViolationReturnType[]) =>
                        processViolations(currentPath, violations, errorList)
                )
            }
        })
    })

    cy.get('html').then(($html) => {
        Object.values(HtmlChecks).forEach((checkFunction) => {
            if (typeof checkFunction === 'function') {
                checkFunction(
                    $html,
                    (violations: CustomViolationReturnType[]) =>
                        processViolations(currentPath, violations, errorList)
                )
            }
        })
    })
}
