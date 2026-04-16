import { createCustomViolation } from './auditor-helper'

export const checkManualButtons = (callback: (violations: any[]) => void) => {
    cy.get('body').then((body) => {
        const buttons = body.find('button')
        if (buttons.length === 0) {
            const manualViolation = createCustomViolation(
                'Description: Page must have at least one button',
                'Help: Page must have at least one button',
                'Placeholder - - - https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html',
                'Placeholder - - - <body>',
                'manual-button-check',
                'serious',
                ['wcag2aa']
            )
            callback([manualViolation])
        }
    })
}
