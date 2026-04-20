import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback, CustomViolationReturnType } from './types'

export const checkBadAltTexts = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const badAltPatterns = [
            /\.(jpg|jpeg|png|gif|tiff|raw|svg|webp|avif)$/i,
            /(graphic|picture|image|photo|icon)/i,
            /placeholder/i,
            /^[0-9]+$/,
            /^[^a-z0-9]+$/i,
            /^.{1}$/,
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
                        help: 'Alternative text must be a meaningful replacement for the image content',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/failures/F30',
                        html: img.outerHTML,
                        failureSummary: [
                            `Change the alt attribute to describe the purpose of the image.`,
                            `Do not use filenames (like .jpg).`,
                            `Do not use generic words like "image" or "placeholder".`,
                            `Do not use only numbers.`,
                            `Do not use only special characters or symbols.`,
                            `Do not use only one character.`,
                        ],
                        tags: ['wcag2a', 'wcag111'],
                    })
                )
            }
        })
        if (violations.length) {
            callback(violations)
        }
    })
}

export const checkVideoCaptionsAndDescriptions = (
    callback: CustomAuditCallback
) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        body.find('video').each((_, video) => {
            const $video = Cypress.$(video)
            const hasCaptions = $video.find('track[kind="captions"]').length > 0
            const hasDescriptions =
                $video.find('track[kind="descriptions"]').length > 0

            if (!hasCaptions) {
                violations.push(
                    createCustomViolation({
                        id: 'video-missing-captions',
                        impact: 'serious',
                        description: 'Video is missing captions.',
                        help: 'Deaf users need captions to understand the content',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/html/H95',
                        html: video.outerHTML,
                        failureSummary: [
                            'Provide a <track kind="captions"> element in the language of the video.',
                        ],
                        tags: ['wcag2a', 'wcag122'],
                    })
                )
            }

            if (!hasDescriptions) {
                violations.push(
                    createCustomViolation({
                        id: 'video-missing-descriptions',
                        impact: 'moderate',
                        description: 'Video is missing audio descriptions.',
                        help: 'Blind users need audio descriptions to understand the visual content',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/html/H96',
                        html: video.outerHTML,
                        failureSummary: [
                            'Provide a <track kind="descriptions"> element in the language of the video.',
                        ],
                        tags: ['wcag2aa', 'wcag125'],
                    })
                )
            }
        })

        if (violations.length) {
            callback(violations)
        }
    })
}

export const checkFieldsetLegend = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        body.find('fieldset').each((_, fieldset) => {
            const $fieldset = Cypress.$(fieldset)
            const legend = $fieldset.find('> legend')
            const firstChild = $fieldset.children().first()

            const hasMultipleLegends = legend.length > 1
            const hasValidLegend =
                legend.length > 0 && legend.text().trim().length > 0
            const isLegendFirst = firstChild.is('legend')

            if (!hasValidLegend || !isLegendFirst || hasMultipleLegends) {
                violations.push(
                    createCustomViolation({
                        id: 'fieldset-bad-legend',
                        impact: 'serious',
                        description:
                            'Every <fieldset> must have one non-empty <legend> as its first child.',
                        help: 'The <legend> element provides the necessary context for grouped form controls',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/html/H71',
                        html: fieldset.outerHTML,
                        failureSummary: [
                            'Add a <legend> element with a meaningful text inside the <fieldset>.',
                            'The <legend> element must be the first child of the <fieldset>.',
                            'Only use one <legend> element per <fieldset>.',
                        ],
                        tags: ['wcag2a', 'wcag131'],
                    })
                )
            }
        })

        if (violations.length) {
            callback(violations)
        }
    })
}

export const checkHeadingOrder = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        const headings = body.find('h1, h2, h3, h4, h5, h6')

        if (headings.length === 0) {
            return
        }

        const firstHeading = headings.first()
        const firstLevel = parseInt(firstHeading[0].tagName.substring(1))

        if (firstLevel !== 1) {
            violations.push(
                createCustomViolation({
                    id: 'heading-order-no-h1',
                    impact: 'serious',
                    description:
                        'The first heading on the page must be an <h1>.',
                    help: 'A page should start with an <h1> to establish the main topic',
                    helpUrl:
                        'https://www.w3.org/WAI/WCAG22/Techniques/general/G141',
                    html: firstHeading[0].outerHTML,
                    failureSummary: [
                        'Change this heading to an <h1> or add an <h1> element before it.',
                    ],
                    tags: ['wcag2a', 'wcag131'],
                })
            )
        }

        let lastLevel = 0
        headings.each((_, el) => {
            const currentLevel = parseInt(el.tagName.substring(1))

            if (lastLevel !== 0 && currentLevel > lastLevel + 1) {
                violations.push(
                    createCustomViolation({
                        id: 'heading-order-jump',
                        impact: 'serious',
                        description: `Heading level skipped: <h${lastLevel}> to <h${currentLevel}>`,
                        help: 'Headings must follow a logical order without skipping levels',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/general/G141',
                        html: el.outerHTML,
                        failureSummary: [
                            `Change this heading to <h${lastLevel + 1}> or higher.`,
                        ],
                        tags: ['wcag2a', 'wcag131'],
                    })
                )
            }
            lastLevel = currentLevel
        })

        if (violations.length) {
            callback(violations)
        }
    })
}
