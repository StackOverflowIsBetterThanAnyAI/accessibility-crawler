import axe from 'axe-core'
import { formatWCAGTag } from './format-wcag-tag'
import { CustomViolationReturnType, CustomViolationType } from './types'

export const createCustomViolation = (
    data: CustomViolationType
): CustomViolationReturnType => {
    const { failureSummary, html, impact, ...rest } = data
    return {
        ...rest,
        impact,
        nodes: [
            {
                failureSummary: `Fix all of the following:\n• ${failureSummary.join('\n• ')}`,
                html,
                impact,
                target: [html],
            },
        ],
    }
}

export const processViolations = (
    currentPath: string,
    violations: (CustomViolationReturnType | axe.Result)[],
    errorList: { id: string; message: string }[]
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
            const formattedMessage =
                `issue on [${currentPath}] - [${tagString} (${violation.impact} severity)]:\n` +
                `${violation.help}.\n\n` +
                `Element: ${node.html}\n\n` +
                `${node.failureSummary?.replace(/\n\s(?!Fix)/g, '\n•')}\n\n` +
                `Help: ${violation.helpUrl}`

            errorList.push({
                id: violation.id,
                message: formattedMessage,
            })
        })
    })
}
