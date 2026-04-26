import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback, CustomViolationReturnType } from './types'

export const checkBadAltTextImage = (callback: CustomAuditCallback) => {
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
                        id: 'bad-alt-image',
                        impact: 'serious',
                        description: `The alt text "${altText}" looks like a filename or placeholder`,
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

export const checkAltTextInputImage = (callback: CustomAuditCallback) => {
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

        body.find('input[type="image"]').each((_, img) => {
            const $img = Cypress.$(img)

            if ($img.is(':hidden')) {
                return
            }

            const alt = $img.attr('alt')
            const ariaLabel = $img.attr('aria-label')?.trim()
            const ariaLabelledBy = $img.attr('aria-labelledby')?.trim()
            const title = $img.attr('title')?.trim()

            const hasNoName =
                !ariaLabel &&
                !ariaLabelledBy &&
                !title &&
                (alt === undefined || alt.trim() === '')

            if (hasNoName) {
                violations.push(
                    createCustomViolation({
                        id: 'bad-alt-input-image',
                        impact: 'serious',
                        description:
                            '<input type="image"> elements must have an accessible name',
                        help: 'The element has no alt attribute, aria-label, aria-labelledby or title',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/failures/F65',
                        html: img.outerHTML,
                        failureSummary: [
                            'Add a meaningful alt attribute.',
                            'Alternatively, use aria-label or aria-labelledby.',
                            'Alternatively, use a descriptive title attribute.',
                        ],
                        tags: ['wcag2a', 'wcag111'],
                    })
                )
                return
            }

            const altText = alt?.trim() || ''
            const isBadAltText = badAltPatterns.some((pattern) =>
                pattern.test(altText)
            )

            if (isBadAltText) {
                violations.push(
                    createCustomViolation({
                        id: 'bad-alt-input-image',
                        impact: 'serious',
                        description: `The alt text "${altText}" looks like a filename or placeholder`,
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
                        description: 'Video is missing captions',
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
                        description: 'Video is missing audio descriptions',
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
                            'Every <fieldset> must have one non-empty <legend> as its first child',
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
                    impact: 'moderate',
                    description:
                        'The first heading on the page must be an <h1>',
                    help: 'A page should start with an <h1>-level heading to establish the main topic',
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

export const checkNonEmptyHeading = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        body.find('h1, h2, h3, h4, h5, h6, [role="heading"]').each((_, el) => {
            const $el = Cypress.$(el)

            const isHidden =
                $el.is(':hidden') ||
                $el.attr('aria-hidden') === 'true' ||
                $el.css('display') === 'none'
            const isDecorative =
                $el.attr('role') === 'presentation' ||
                $el.attr('role') === 'none'

            if (isHidden || isDecorative) {
                return
            }

            let accessibleName = ''

            const labelledBy = $el.attr('aria-labelledby')
            if (labelledBy) {
                const target = document.getElementById(
                    labelledBy.split(/\s+/)[0]
                )
                accessibleName = target?.innerText || target?.textContent || ''
            }

            if (!accessibleName.trim()) {
                accessibleName = $el.attr('aria-label') || ''
            }

            if (!accessibleName.trim()) {
                const hasImages = $el.find('img').length > 0
                if (hasImages) {
                    let combinedText = ''
                    $el.contents().each((_, node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            combinedText += node.textContent
                        } else if (node.nodeName === 'IMG') {
                            combinedText +=
                                (node as HTMLImageElement).getAttribute(
                                    'alt'
                                ) || ''
                        } else {
                            combinedText += Cypress.$(node).text()
                        }
                    })
                    accessibleName = combinedText
                } else {
                    accessibleName = $el.text()
                }
            }

            if (!accessibleName.trim()) {
                violations.push(
                    createCustomViolation({
                        id: 'non-empty-heading',
                        impact: 'serious',
                        description: 'Heading has no accessible name.',
                        help: 'Headings must have text or an aria-label to be useful for screen reader users.',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/general/G130',
                        html: el.outerHTML,
                        failureSummary: [
                            'The heading content is programmatically empty.',
                            'Add text content, an aria-label, or descriptive alt-text for images inside the heading.',
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

export const checkAdjacentLinks = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        const links = body.find('a[href]')

        if (links.length < 2) {
            return
        }

        links.each((index, el) => {
            if (index >= links.length - 1) {
                return
            }

            const currentLink = el as HTMLAnchorElement
            const nextLink = links[index + 1] as HTMLAnchorElement

            if (currentLink.href && currentLink.href === nextLink.href) {
                const range = document.createRange()
                range.setStartAfter(currentLink)
                range.setEndBefore(nextLink)

                const textBetween = range.toString().trim()

                if (textBetween === '') {
                    violations.push(
                        createCustomViolation({
                            id: 'adjacent-redundant-links',
                            impact: 'serious',
                            description:
                                'Adjacent links to the same destination should be combined',
                            help: 'Combining adjacent image and text links for the same resource improves navigation for screen reader users',
                            helpUrl:
                                'https://www.w3.org/WAI/WCAG22/Techniques/html/H2',
                            html:
                                currentLink.outerHTML +
                                ' ... ' +
                                nextLink.outerHTML,
                            failureSummary: [
                                'Combine these two adjacent links into a single <a> tag.',
                                'Check that every <img> element contained within the <a> element has a null value set for its alt attribute.',
                                'Check that the <a> element contains an <img> element that has either a null alt attribute value or a value that supplements the link text and describes the image.',
                            ],
                            tags: ['wcag2a', 'wcag111'],
                        })
                    )
                }
            }
        })

        if (violations.length) {
            callback(violations)
        }
    })
}

export const checkConflictDecorativeRole = (callback: CustomAuditCallback) => {
    cy.get('body').then((body) => {
        const violations: CustomViolationReturnType[] = []
        body.find('[role="presentation"], [role="none"]').each((_, el) => {
            const $el = Cypress.$(el)

            const alt = $el.attr('alt')?.trim()
            const ariaLabel = $el.attr('aria-label')?.trim()
            const ariaLabelledBy = $el.attr('aria-labelledby')?.trim()
            const title = $el.attr('title')?.trim()
            const tabIndex = $el.attr('tabindex')

            const isFocusable =
                tabIndex !== undefined && parseInt(tabIndex) >= 0
            const hasAriaName = !!ariaLabel || !!ariaLabelledBy || !!title

            if (isFocusable || hasAriaName) {
                violations.push(
                    createCustomViolation({
                        id: 'conflict-decorative-role',
                        impact: 'serious',
                        description:
                            'Element has role="presentation" or "none" but also a text alternative',
                        help: 'Decorative elements should not have an accessible name to avoid confusing assistive technologies',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/failures/F38',
                        html: el.outerHTML,
                        failureSummary: [
                            'Remove the aria-label/-labelledby, title or non-empty alt attribute if the element is purely decorative.',
                            'Or remove the role="presentation"/"none" if the element is actually important.',
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

export const checkFirstValidMetaRefresh = (callback: CustomAuditCallback) => {
    cy.get('head').then((head) => {
        const violations: CustomViolationReturnType[] = []

        let firstValidElement: HTMLElement | null = null
        let detectedDelay = -1

        head.find('meta[http-equiv="refresh"]').each((_, el) => {
            if (firstValidElement) {
                return
            }

            const content = el.getAttribute('content')?.trim() || ''

            const match = content.match(/^\s*(\d+)(?:\s*;|\s*$)/)

            if (match) {
                firstValidElement = el
                detectedDelay = parseInt(match[1], 10)
            }
        })

        if (firstValidElement && detectedDelay > 72000) {
            violations.push(
                createCustomViolation({
                    id: 'meta-refresh-delay',
                    impact: 'serious',
                    description: `The first valid meta refresh has a delay of ${detectedDelay} seconds`,
                    help: 'Delayed refreshes must not exceed 72,000 seconds (20 hours)',
                    html: (firstValidElement as HTMLElement).outerHTML,
                    helpUrl:
                        'https://www.w3.org/WAI/WCAG21/Techniques/failures/F40',
                    failureSummary: [
                        'The delay specified in <meta http-equiv="refresh"> exceeds the 72,000-second limit.',
                        'To pass level A: Use a server-side redirect or set the delay to 0.',
                        'To pass level AAA: Avoid any automatic refresh entirely.',
                    ],
                    tags: ['wcag2a', 'wcag221'],
                })
            )
        }

        if (violations.length) {
            callback(violations)
        }
    })
}
