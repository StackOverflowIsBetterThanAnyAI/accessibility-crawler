import { createCustomViolation } from './auditor-helper'

export const checkButtons = (callback: (violations: any[]) => void) => {
    cy.get('body').then((body) => {
        const buttons = body.find('button')
        if (buttons.length === 0) {
            const violation = createCustomViolation(
                'Description: Page must have at least one button',
                ['The page must contain at least one button', 'Add one button'],
                'Help: Page must have at least one button',
                'Placeholder - - - https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html',
                'Placeholder - - - <button>',
                'manual-button-check',
                'serious',
                ['wcag2aa']
            )
            callback([violation])
        }
    })
}

export const checkInputs = (callback: (violations: any[]) => void) => {
    cy.get('body').then((body) => {
        const inputs = body.find('input')
        if (inputs.length === 0) {
            const violation = createCustomViolation(
                'Description: Page must have at least one input',
                ['The page must contain at least one input', 'Add one input'],
                'Help: Page must have at least one input',
                'Placeholder - - - https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html',
                'Placeholder - - - <input>',
                'manual-input-check',
                'moderate',
                ['wcag21aa']
            )
            callback([violation])
        }
    })
}
