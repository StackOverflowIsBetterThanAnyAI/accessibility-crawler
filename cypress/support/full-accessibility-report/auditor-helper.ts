import { formatWCAGTag } from './format-wcag-tag'

export const createCustomViolation = (
    description: string,
    help: string,
    helpUrl: string,
    html: string,
    id: string,
    impact: 'serious' | 'critical' | 'moderate',
    tags: ('wcag2a' | 'wcag2aa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa')[]
) => {
    return {
        id,
        impact,
        description,
        help,
        helpUrl,
        nodes: [
            {
                failureSummary: `Fix any of the following:\n• The page must contain at least one ${id}`,
                html,
                impact,
                target: [html],
            },
        ],
        tags,
    }
}

export const processViolations = (
    currentPath: string,
    violations: any[],
    errorList: string[]
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
            const message =
                `on [${currentPath}]: [${tagString}] (${violation.impact} severity):\n` +
                `${violation.help}.\n\n` +
                `Element: ${node.html}\n\n` +
                `${node.failureSummary?.replace(/\n\s/g, '\n•')}\n\n` +
                `Help: ${violation.helpUrl}`

            errorList.push(message)
        })
    })
}
