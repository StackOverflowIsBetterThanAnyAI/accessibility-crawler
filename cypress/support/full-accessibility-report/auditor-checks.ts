import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback } from './types'

export const checkButtons = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const buttons = body.find('button')
        if (buttons.length === 0) {
            const violation = createCustomViolation({
                description: 'Description: Page must have at least one button',
                failureSummary: [
                    'The page must contain at least one button',
                    'Add one button',
                ],
                help: 'Help: Page must have at least one button',
                helpUrl:
                    'Placeholder - - - https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html',
                html: 'Placeholder - - - <button>',
                id: 'manual-button-check',
                impact: 'serious',
                tags: ['wcag2aa'],
            })
            callback([violation])
        }
    })
}
