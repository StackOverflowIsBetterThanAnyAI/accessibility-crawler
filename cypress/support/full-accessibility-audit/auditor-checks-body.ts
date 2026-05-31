import { franc } from 'franc'
import { createCustomViolation } from './auditor-helper'
import { CustomAuditCallback, CustomViolationReturnType } from './types'
import { checkLanguageCompatibility } from './check-language-compatibility'

export const checkBadAltTextImage = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const badAltPatterns = [
        /\.(jpg|jpeg|png|gif|tiff|raw|svg|webp|avif)$/i,
        /(graphic|picture|image|photo|icon|logo)/i,
        /(grafik|abbildung|bild|foto|symbol)/i,
        /placeholder/i,
        /platzhalter/i,
        /^[0-9]+$/,
        /^[^a-z0-9]+$/i,
        /^.{1}$/,
    ]
    const violations: CustomViolationReturnType[] = []

    $body.find('img[alt]').each((_, img) => {
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
                        'Change the alt attribute to describe the purpose of the image.',
                        'Do not use filenames (like .jpg).',
                        'Do not use generic words like "image" or "placeholder".',
                        'Do not use only numbers.',
                        'Do not use only special characters or symbols.',
                        'Do not use only one character.',
                    ],
                    tags: ['wcag2a', 'wcag111'],
                    element: img,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkAltTextInputImage = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const badAltPatterns = [
        /\.(jpg|jpeg|png|gif|tiff|raw|svg|webp|avif)$/i,
        /(graphic|picture|image|photo|icon|logo)/i,
        /(grafik|abbildung|bild|foto|symbol)/i,
        /placeholder/i,
        /platzhalter/i,
        /^[0-9]+$/,
        /^[^a-z0-9]+$/i,
        /^.{1}$/,
    ]
    const violations: CustomViolationReturnType[] = []

    $body.find('input[type="image"]').each((_, img) => {
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
                    element: img,
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
                        'Change the alt attribute to describe the purpose of the image.',
                        'Do not use filenames (like .jpg).',
                        'Do not use generic words like "image" or "placeholder".',
                        'Do not use only numbers.',
                        'Do not use only special characters or symbols.',
                        'Do not use only one character.',
                    ],
                    tags: ['wcag2a', 'wcag111'],
                    element: img,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkBadFormLabels = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const badLabelPattern = /^[^\p{L}0-9]+$/iu
    const violations: CustomViolationReturnType[] = []

    $body.find('label').each((_, label) => {
        const labelText = Cypress.$(label).text()?.trim() || ''

        const isNoneOrBadLabelText =
            labelText.length <= 1 || badLabelPattern.test(labelText)

        if (isNoneOrBadLabelText) {
            violations.push(
                createCustomViolation({
                    id: 'bad-form-label',
                    impact: 'serious',
                    description: `The label "${labelText}" is uninformative`,
                    help: 'Form labels must clearly describe the purpose of the input field and cannot be empty or consist only of non-alphanumeric characters',
                    helpUrl:
                        'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html',
                    html: label.outerHTML,
                    failureSummary: [
                        'Provide a meaningful, visible text within the label.',
                        'Do not use only special characters or symbols.',
                        'Do not use only one single character.',
                    ],
                    tags: ['wcag2aa', 'wcag246'],
                    element: label,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkListStructure = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []

    $body.find('ul, ol, [role="list"]').each((_, list) => {
        const $list = Cypress.$(list)

        const role = $list.attr('role')
        if (role === 'presentation' || role === 'none') {
            return
        }

        $list.children().each((__, child) => {
            const $child = Cypress.$(child)

            if (
                $child.is('script, template') ||
                $child.attr('aria-hidden') === 'true' ||
                $child.css('display') === 'none'
            ) {
                return
            }

            const childRole = $child.attr('role')
            const isListItem = $child.is('li') || childRole === 'listitem'

            if (!isListItem) {
                violations.push(
                    createCustomViolation({
                        id: 'list-invalid-structure',
                        impact: 'serious',
                        description:
                            'List element contains invalid child elements',
                        help: 'Elements with a list role must only contain listitem elements',
                        helpUrl:
                            'https://www.w3.org/WAI/WCAG22/Techniques/html/H48',
                        html: list.outerHTML,
                        failureSummary: [
                            'Direct children of a list must be <li> elements or have the role "listitem".',
                        ],
                        tags: ['wcag2a', 'wcag131'],
                        element: list,
                    })
                )
            }
        })
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkVideoCaptions = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    $body.find('video').each((_, video) => {
        const $video = Cypress.$(video)
        if (video.hasAttribute('muted')) {
            return
        }
        const hasCaptions = $video.find('track[kind="captions"]').length > 0

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
                    element: video,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkFieldsetLegend = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    $body.find('fieldset').each((_, fieldset) => {
        const $fieldset = Cypress.$(fieldset)
        const legend = $fieldset.find('> legend')
        const firstChild = $fieldset.children().first()

        const hasMultipleLegends = legend.length > 1

        const legendText = legend.text().trim()
        const hasValidLegend =
            legend.length && legendText.length && /\p{L}/u.test(legendText)

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
                        'Use only one <legend> element per <fieldset>.',
                    ],
                    tags: ['wcag2a', 'wcag131'],
                    element: fieldset,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkHeadingOrder = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    const headings = $body.find('h1, h2, h3, h4, h5, h6')

    if (!headings.length) {
        return
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
                    element: el,
                })
            )
        }
        lastLevel = currentLevel
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkNonEmptyHeading = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    $body.find('h1, h2, h3, h4, h5, h6, [role="heading"]').each((_, el) => {
        const $el = Cypress.$(el)

        const role = $el.attr('role')
        const hasAriaLabel = $el.attr('aria-label') !== undefined
        const hasAriaLabelledBy = !!$el.attr('aria-labelledby')

        if (
            (role === 'presentation' || role === 'none') &&
            !hasAriaLabel &&
            !hasAriaLabelledBy
        ) {
            return
        }

        const isHiddenInTree =
            $el.attr('aria-hidden') === 'true' ||
            $el.closest('[aria-hidden="true"]').length > 0
        if (isHiddenInTree) {
            return
        }

        let accessibleName = ''

        if (hasAriaLabelledBy) {
            const ids = $el.attr('aria-labelledby')!.split(/\s+/)
            ids.forEach((id) => {
                const $target = $body.find(`#${id}`)
                if ($target.length > 0) {
                    accessibleName += $target.text() || ''
                }
            })
        } else if (hasAriaLabel) {
            accessibleName = $el.attr('aria-label') || ''
        } else {
            const $clone = $el.clone()
            $clone.find('[aria-hidden="true"]').remove()

            $clone.find('img').each((__, img) => {
                const $img = Cypress.$(img)
                const alt = $img.attr('alt')
                const imgRole = $img.attr('role')
                if (imgRole === 'presentation' || imgRole === 'none') {
                    $img.replaceWith('')
                } else {
                    $img.replaceWith(alt || '')
                }
            })
            accessibleName = $clone.text()
        }

        if (!accessibleName.trim().length) {
            violations.push(
                createCustomViolation({
                    id: 'non-empty-heading',
                    impact: 'serious',
                    description: 'Heading has no accessible name',
                    help: 'Headings must have text or an aria-label to be useful for screen reader users',
                    helpUrl:
                        'https://www.w3.org/WAI/WCAG22/Techniques/general/G130',
                    html: el.outerHTML,
                    failureSummary: [
                        'The heading content is currently programmatically empty.',
                        'Add text content, an aria-label, or descriptive alt-text for images inside the heading.',
                    ],
                    tags: ['wcag2a', 'wcag131'],
                    element: el,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkAdjacentLinks = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    const links = $body.find('a[href]')

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
                        element: currentLink,
                    })
                )
            }
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkConflictDecorativeRole = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    $body.find('[role="presentation"], [role="none"]').each((_, el) => {
        const $el = Cypress.$(el)

        const ariaLabel = $el.attr('aria-label')?.trim()
        const ariaLabelledBy = $el.attr('aria-labelledby')?.trim()
        const title = $el.attr('title')?.trim()
        const tabIndex = $el.attr('tabindex')

        const isFocusable = tabIndex !== undefined && parseInt(tabIndex) >= 0
        const hasAccessibleName = !!ariaLabel || !!ariaLabelledBy || !!title

        if (isFocusable || hasAccessibleName) {
            violations.push(
                createCustomViolation({
                    id: 'conflict-decorative-role',
                    impact: 'serious',
                    description:
                        'Element has role="presentation" or "none" but also a text alternative',
                    help: 'Decorative elements should not have an accessible name to avoid confusing assistive technologies',
                    helpUrl:
                        'https://www.w3.org/WAI/standards-guidelines/act/rules/46ca7f/proposed/',
                    html: el.outerHTML,
                    failureSummary: [
                        'Remove the aria-label or aria-labelledby attribute, title, or custom tabindex if the element is purely decorative.',
                        'Or remove the role="presentation"/"none" if the element is actually important.',
                    ],
                    tags: ['wcag2a', 'wcag111'],
                    element: el,
                })
            )
        }
    })

    $body.find('img[alt=""]').each((_, el) => {
        const $el = Cypress.$(el)

        const ariaLabel = $el.attr('aria-label')?.trim()
        const ariaLabelledBy = $el.attr('aria-labelledby')?.trim()
        const role = $el.attr('role')?.trim()

        const hasAltAriaConflict = ariaLabelledBy?.length || ariaLabel?.length

        if (hasAltAriaConflict && !role) {
            violations.push(
                createCustomViolation({
                    id: 'conflict-decorative-role',
                    impact: 'serious',
                    description:
                        'Image has an empty alt attribute but also a text alternative',
                    help: 'Decorative elements should not have an accessible name to avoid confusing assistive technologies',
                    helpUrl:
                        'https://www.w3.org/WAI/standards-guidelines/act/rules/46ca7f/proposed/',
                    html: el.outerHTML,
                    failureSummary: [
                        'Remove aria-label or aria-labelledby if the image is purely decorative.',
                        'Or replace alt="" with a meaningful alt text if the image conveys information.',
                    ],
                    tags: ['wcag2a', 'wcag111'],
                    element: el,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkDetailsSummary = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []

    $body.find('details').each((_, el) => {
        const $details = Cypress.$(el)
        const isHidden =
            $details.is(':hidden') ||
            $details.css('display') === 'none' ||
            $details.attr('aria-hidden') === 'true'
        if (isHidden) {
            return
        }

        const $summary = $details.children('summary').first()

        const role = $summary.attr('role')?.trim().toLowerCase()
        let decorativeRoleConflict = false

        if (role === 'presentation' || role === 'none') {
            decorativeRoleConflict = true
        }

        if (role && role !== 'summary' && !decorativeRoleConflict) {
            return
        }

        let accessibleName = ''

        const labelledBy = $summary.attr('aria-labelledby')
        if (labelledBy) {
            const target = $body.find(`#${labelledBy}`)
            accessibleName = target.text().trim()
        }

        if (!accessibleName) {
            accessibleName = $summary.attr('aria-label')?.trim() || ''
        }

        if (!accessibleName) {
            accessibleName = $summary.text().trim()
        }

        if (
            ($summary.length && accessibleName === '') ||
            decorativeRoleConflict
        ) {
            violations.push(
                createCustomViolation({
                    id: 'details-summary-name',
                    impact: 'serious',
                    description:
                        'Details element must have a visible and accessible summary name',
                    help: 'The <summary> element provides the label for the expandable <details> widget. It must therefore not be empty',
                    helpUrl:
                        'https://www.w3.org/WAI/standards-guidelines/act/rules/2t702h/proposed/',
                    html: $summary.length
                        ? $summary[0].outerHTML
                        : $details[0].outerHTML,
                    failureSummary: [
                        'The summary element must have a non-empty text content or an aria-label/labelledby attribute.',
                        'The summary element must not have a decorative role (presentation/none).',
                    ],
                    tags: ['wcag2a', 'wcag412'],
                    element: $summary.length ? $summary[0] : $details[0],
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkProhibitedAria = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []
    const namingProhibitedRoles = [
        'generic',
        'paragraph',
        'none',
        'presentation',
    ]
    const prohibitedAttributes = [
        'aria-label',
        'aria-labelledby',
        'aria-roledescription',
        'aria-braillelabel',
        'aria-brailleroledescription',
    ]

    $body.find('*').each((_, el) => {
        const $el = Cypress.$(el)
        const presentProhibitedAttrs = prohibitedAttributes.filter((attr) =>
            el.hasAttribute(attr)
        )

        if (!presentProhibitedAttrs.length) {
            return
        }

        if (
            $el.is(':hidden') ||
            $el.attr('aria-hidden') === 'true' ||
            $el.closest('[hidden]').length
        ) {
            return
        }

        const tagName = el.tagName.toLowerCase()
        const explicitRole = $el.attr('role')?.trim().toLowerCase()

        let effectiveRole = explicitRole
        if (!effectiveRole) {
            if (tagName === 'div' || tagName === 'span') {
                effectiveRole = 'generic'
            } else if (tagName === 'p') {
                effectiveRole = 'paragraph'
            }
        }

        if (effectiveRole && namingProhibitedRoles.includes(effectiveRole)) {
            presentProhibitedAttrs.forEach((attr) => {
                violations.push(
                    createCustomViolation({
                        id: 'prohibited-aria-naming',
                        impact: 'serious',
                        description: `The attribute "${attr}" is prohibited on a "${effectiveRole}" element`,
                        help: `Elements with role "${effectiveRole}" (like plain divs or paragraphs) cannot be given an accessible name`,
                        helpUrl:
                            'https://www.w3.org/WAI/standards-guidelines/act/rules/kb1m8s/proposed/',
                        html: el.outerHTML,
                        failureSummary: [
                            `Element <${tagName}> is acting as role "${effectiveRole}".`,
                            `The attribute "${attr}" is not allowed here because this role is purely structural and cannot be named.`,
                        ],
                        tags: ['wcag2a', 'wcag131'],
                        element: el,
                    })
                )
            })
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkLanguageMismatch = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []

    $body.find('[lang]').each((_, el) => {
        const $el = Cypress.$(el)
        const declaredLang = $el.attr('lang')?.trim().toLowerCase()
        if (!declaredLang) {
            return
        }

        const extraText = []

        if ($el.attr('aria-label')) {
            extraText.push($el.attr('aria-label'))
        }

        $el.find('img[alt]').each((_, img) => {
            const $img = Cypress.$(img)
            if ($img.closest('[lang]').is($el)) {
                extraText.push($img.attr('alt'))
            }
        })

        const labelledBy = $el.attr('aria-labelledby')
        if (labelledBy) {
            const ids = labelledBy.split(/\s+/)
            ids.forEach((id) => {
                const labelElement = $body.find(`#${id}`)
                if (labelElement.length) {
                    extraText.push(labelElement.text())
                }
            })
        }

        const clone = $el.clone()
        clone.find('[lang]').remove()
        clone.find('script, style, noscript').remove()

        const cleanText = (clone.text() + ' ' + extraText.join(' '))
            .replace(/\s+/g, ' ')
            .trim()
        if (cleanText.length < 30) {
            return
        }

        const detectedLang3 = franc(cleanText)
        if (detectedLang3 === 'und') {
            return
        }

        if (!checkLanguageCompatibility(declaredLang, detectedLang3)) {
            violations.push(
                createCustomViolation({
                    id: 'language-mismatch',
                    impact: 'moderate',
                    description: `The declared language "${declaredLang}" does not match the detected language`,
                    help: 'The text appears to be in a different language than specified',
                    helpUrl:
                        'https://www.w3.org/WAI/standards-guidelines/act/rules/off6ek/proposed/',
                    html: el.outerHTML,
                    failureSummary: [
                        `Declared lang attribute: "${declaredLang}".`,
                        `Detected language (NLP): "${detectedLang3}".`,
                        'Ensure the "lang" attribute correctly identifies the primary language of the text content.',
                    ],
                    tags: ['wcag2aa', 'wcag312'],
                    element: el,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkLabelInNameStrict = (
    $body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const violations: CustomViolationReturnType[] = []

    const widgetRoles = [
        'button',
        'checkbox',
        'link',
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'option',
        'radio',
        'switch',
        'tab',
        'treeitem',
    ]

    $body.find('[aria-label], [aria-labelledby]').each((_, el) => {
        const $el = Cypress.$(el)

        if ($el.is(':hidden') || $el.css('visibility') === 'hidden') {
            return
        }

        const tagName = el.tagName.toUpperCase()
        const role = $el.attr('role') || tagName.toLowerCase()

        const isSupportedWidget =
            widgetRoles.includes(role) ||
            (tagName === 'A' && $el.attr('href')) ||
            tagName === 'BUTTON'

        if (!isSupportedWidget) {
            return
        }

        const visibleText = $el.text().trim()
        if (visibleText.length <= 1) {
            return
        }

        const hasIconFont = () => {
            const font = $el.css('font-family').toLowerCase()
            return (
                font.includes('icon') ||
                font.includes('symbol') ||
                font.includes('material')
            )
        }
        if (hasIconFont()) {
            return
        }

        let accessibleName = ''
        if ($el.attr('aria-label')) {
            accessibleName = $el.attr('aria-label') || ''
        } else if ($el.attr('aria-labelledby')) {
            const ids = ($el.attr('aria-labelledby') || '').split(/\s+/)
            accessibleName = ids
                .map((id) => {
                    const $target = $body.find(`#${id}`)
                    return !$target.length ? '' : $target.text()
                })
                .filter((text) => text.trim().length)
                .join(' ')
        }

        const cleanVisible = visibleText
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
        const cleanAccessible = accessibleName
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()

        if (!cleanAccessible.includes(cleanVisible)) {
            violations.push(
                createCustomViolation({
                    id: 'label-in-name',
                    impact: 'serious',
                    description: `The visible label "${visibleText}" is not part of the accessible name "${accessibleName}"`,
                    help: 'The visible text of a widget must be included in the accessible name',
                    helpUrl:
                        'https://www.w3.org/WAI/standards-guidelines/act/rules/2ee8b8/proposed/',
                    html: el.outerHTML,
                    failureSummary: [
                        `Visible Label: "${visibleText}".`,
                        `Accessible Name: "${accessibleName}".`,
                        'The visible text of a widget must be included in the accessible name.',
                    ],
                    tags: ['wcag2a', 'wcag253'],
                    element: el,
                })
            )
        }
    })

    if (violations.length) {
        callback(violations)
    }
}

export const checkDynamicContrast = (
    _$body: JQuery<HTMLElement>,
    callback: CustomAuditCallback
) => {
    const selector =
        'a[href]:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex^="-"]):not([disabled])'

    cy.get('body', { log: false }).then(($body) => {
        const $elements = $body.find(selector)

        const $visibleElements = $elements.filter((_, el) => {
            const $el = Cypress.$(el)
            if ($el.is(':hidden') || $el.css('display') === 'none') {
                return false
            }
            return true
        })

        if (!$visibleElements.length) {
            return
        }

        cy.wrap($visibleElements, { log: false }).each(($el) => {
            const el = $el[0]

            cy.wrap($el).trigger('mouseover', { force: true })
            cy.checkA11y(
                el,
                { runOnly: { type: 'rule', values: ['color-contrast'] } },
                (violations) => {
                    if (violations.length) {
                        const customViolations = violations.map((v) => {
                            const axeSummary =
                                v.nodes[0]?.failureSummary ||
                                'Element does not have sufficient color contrast.'
                            return createCustomViolation({
                                id: 'contrast-hover-state',
                                impact: 'serious',
                                description:
                                    'Elements must maintain sufficient contrast ratio in hover state',
                                help: 'Elements must maintain sufficient contrast ratio when hovered',
                                helpUrl:
                                    'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
                                html: el.outerHTML,
                                failureSummary: [
                                    axeSummary,
                                    'Increase the color contrast of text and interactive elements to at least 4.5:1 for normal text and 3:1 for large text when hovered.',
                                ],
                                tags: ['wcag2aa', 'wcag143'],
                                element: el,
                            })
                        })
                        callback(customViolations)
                    }
                },
                true
            )
            cy.wrap($el).trigger('mouseout', { force: true })

            cy.wrap($el).focus()
            cy.checkA11y(
                el,
                { runOnly: { type: 'rule', values: ['color-contrast'] } },
                (violations) => {
                    if (violations.length) {
                        const customViolations = violations.map((v) => {
                            const axeSummary =
                                v.nodes[0]?.failureSummary ||
                                'Element does not have sufficient color contrast.'
                            return createCustomViolation({
                                id: 'contrast-focus-state',
                                impact: 'serious',
                                description:
                                    'Elements must maintain sufficient contrast ratio in focus state',
                                help: 'Elements must maintain sufficient contrast ratio when focused via keyboard',
                                helpUrl:
                                    'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
                                html: el.outerHTML,
                                failureSummary: [
                                    axeSummary,
                                    'Increase the color contrast of text and interactive elements to at least 4.5:1 for normal text and 3:1 for large text when focused.',
                                ],
                                tags: ['wcag2aa', 'wcag143'],
                                element: el,
                            })
                        })
                        callback(customViolations)
                    }
                },
                true
            )
            cy.wrap($el).blur()
        })
    })
}
