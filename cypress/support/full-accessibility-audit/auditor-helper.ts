import axe from 'axe-core'
import { formatWCAGTag } from './format-wcag-tag'
import {
    CustomViolationReturnType,
    CustomViolationType,
    ViewportType,
} from './types'

export const createCustomViolation = (
    data: CustomViolationType
): CustomViolationReturnType => {
    const { failureSummary, html, impact, ...rest } = data
    return {
        ...rest,
        impact,
        nodes: [
            {
                failureSummary: `Fix all of the following:\n• ${failureSummary.filter((item) => item).join('\n• ')}`,
                html,
                impact,
                target: [html],
            },
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
    errorList: {
        id: string
        message: string
        viewports: ViewportType[]
        uniqueKey: string
    }[],
    currentViewport: ViewportType
) => {
    violations.forEach((violation) => {
        const tagString =
            violation.tags
                .filter((tag: string) => /^wcag/i.test(tag))
                .map((tag: string) => formatWCAGTag(tag))
                .join(', ') || 'no WCAG reference'

        violation.nodes.forEach(
            (
                node:
                    | CustomViolationReturnType['nodes'][0]
                    | axe.Result['nodes'][0]
            ) => {
                let exactDomLocation = ''

                if (Array.isArray(node.target) && node.target.length > 0) {
                    exactDomLocation = node.target.join(' > ')
                } else {
                    const rawElement =
                        (node as any).element ||
                        document.querySelector(node.html)
                    exactDomLocation = getUniqueSelector(rawElement)
                }

                const uniqueKey = `${currentPath}-${violation.id}-${exactDomLocation}`

                const existingError = errorList.find(
                    (err) => err.uniqueKey === uniqueKey
                )

                if (existingError) {
                    if (!existingError.viewports.includes(currentViewport)) {
                        existingError.viewports.push(currentViewport)
                    }
                } else {
                    const formattedMessage =
                        `issue on [${currentPath}] - [${tagString} (${violation.impact} severity)]:\n` +
                        `${violation.help}.\n\n` +
                        `Element: ${node.html}\n\n` +
                        `Exact DOM Position: ${exactDomLocation}\n\n` +
                        `${node.failureSummary?.replace(/\n\s(?!Fix)/g, '\n•')}\n\n` +
                        `Help: ${violation.helpUrl}`

                    errorList.push({
                        id: violation.id,
                        uniqueKey: uniqueKey,
                        message: formattedMessage,
                        viewports: [currentViewport],
                    })
                }
            }
        )
    })
}
