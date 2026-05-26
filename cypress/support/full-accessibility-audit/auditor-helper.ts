import axe from 'axe-core'
import { formatWCAGTag } from './format-wcag-tag'
import {
    CustomViolationReturnType,
    CustomViolationType,
    ErrorListType,
    ViewportType,
    ViolationNodeType,
} from './types'

export const createCustomViolation = (
    data: CustomViolationType & { element: HTMLElement }
): CustomViolationReturnType => {
    const { failureSummary, html, impact, element, ...rest } = data
    return {
        ...rest,
        impact,
        nodes: [
            {
                failureSummary: `Fix all of the following:\n• ${failureSummary.filter((item) => item).join('\n• ')}`,
                html,
                impact,
                target: [],
                element: element,
            } as ViolationNodeType,
        ],
    }
}

const getUniqueSelector = (element: HTMLElement | null): string => {
    if (!element) {
        return 'unknown-element'
    }
    if (element.id) {
        return `#${element.id}`
    }

    const path: string[] = []
    let current: HTMLElement | null = element

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        if (current.id) {
            path.unshift(`#${current.id}`)
            break
        }

        let siblingIndex = 1
        let sibling = current.previousElementSibling

        while (sibling) {
            if (sibling.tagName === current.tagName) {
                siblingIndex++
            }
            sibling = sibling.previousElementSibling
        }

        const tagName = current.tagName.toLowerCase()
        path.unshift(`${tagName}:nth-of-type(${siblingIndex})`)
        current = current.parentElement as HTMLElement | null
    }

    return path.join(' > ')
}

export const processViolations = (
    currentPath: string,
    violations: (CustomViolationReturnType | axe.Result)[],
    errorList: ErrorListType[],
    currentViewport: ViewportType
) => {
    violations.forEach((violation) => {
        const nodesCount = violation.nodes.length

        Cypress.log({
            displayName: 'a11y error!',
            message: `${violation.id} on ${nodesCount} Node${nodesCount !== 1 ? 's' : ''}`,
            consoleProps: () => ({
                Command: 'ally error!',
                Id: violation.id,
                Impact: violation.impact,
                Tags: violation.tags,
                Description: violation.description,
                Help: violation.help,
                Helpurl: violation.helpUrl,
                Nodes: violation.nodes,
            }),
        })

        const tagString =
            violation.tags
                .filter((tag: string) => /^wcag/i.test(tag))
                .map((tag: string) => formatWCAGTag(tag))
                .join(', ') || 'no WCAG reference'

        violation.nodes.forEach((node: any) => {
            let exactDomLocation = ''

            if (
                Array.isArray(node.target) &&
                node.target.length > 0 &&
                !node.target[0].startsWith('<')
            ) {
                exactDomLocation = node.target.join(' > ')
            } else {
                let rawElement: HTMLElement | null = null

                if (node.element) {
                    rawElement = node.element
                } else if (node.html) {
                    try {
                        rawElement = document.querySelector(node.html)
                    } catch {
                        rawElement = null
                    }
                }

                exactDomLocation = getUniqueSelector(rawElement)
            }

            const uniqueKey = `${currentPath}-${violation.id}-${exactDomLocation}`

            const existingError = errorList.find(
                (err) => err.uniqueKey === uniqueKey
            )

            if (existingError) {
                if (!existingError.viewports.includes(currentViewport)) {
                    existingError.viewports.push(currentViewport)

                    existingError.message = existingError.message.replace(
                        /Viewport: Only found on.*/,
                        `Viewport: Found on mobile & desktop viewports.`
                    )
                }
            } else {
                const formattedMessage =
                    `issue on [${currentPath}] - [${tagString} (${violation.impact} severity)]:\n` +
                    `${violation.help}.\n\n` +
                    `Element: ${node.html}\n\n` +
                    `Exact DOM Position: ${exactDomLocation}\n\n` +
                    `${node.failureSummary?.replace(/\n\s(?!Fix)/g, '\n•')}\n\n` +
                    `Viewport: Only found on ${currentViewport} viewport.\n\n` +
                    `Help: ${violation.helpUrl}`

                errorList.push({
                    id: violation.id,
                    uniqueKey: uniqueKey,
                    message: formattedMessage,
                    viewports: [currentViewport],
                })
            }
        })
    })
}
