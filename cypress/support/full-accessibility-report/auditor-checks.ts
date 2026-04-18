import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback, CustomViolationReturnType } from './types'

export const checkButtons = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        const buttons = body.find('button')

        if (buttons.length === 0) {
            violations.push(
                createCustomViolation({
                    description:
                        'Description: Page must have at least one button',
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
            )
        }
        if (violations.length) {
            callback(violations)
        }
    })
}

export const checkBadAltTexts = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const badAltPatterns = [
            /\.(jpg|jpeg|png|gif|tiff|raw|svg|webp|avif)$/i,
            /(graphic|picture|image|photo|icon)/i,
            /placeholder/i,
        ]
        const violations: CustomViolationReturnType[] = []

        body.find('img[alt]').each((_, img) => {
            const altText = Cypress.$(img).attr('alt')?.trim() || ''
            const isBadAltText = badAltPatterns.some((pattern) =>
                pattern.test(altText)
            )

            if (isBadAltText) {
                violations.push(
                    createCustomViolation({
                        id: 'bad-alt-text',
                        impact: 'serious',
                        description: `The alt text "${altText}" looks like a filename or placeholder.`,
                        help: 'Alternative text must be a meaningful replacement for the image content.',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/failures/F30',
                        html: img.outerHTML,
                        failureSummary: [
                            `Change the alt attribute to describe the purpose of the image.`,
                            `Do not use filenames (like .jpg).`,
                            `Do not use generic words like "image" or "placeholder".`,
                        ],
                        tags: ['wcag2a'],
                    })
                )
            }
        })
        if (violations.length) {
            callback(violations)
        }
    })
}
