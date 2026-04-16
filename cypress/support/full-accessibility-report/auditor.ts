import { formatWCAGTag } from './format-wcag-tag'

const createCustomViolation = (
    id: string,
    help: string,
    helpUrl: string,
    impact: 'serious' | 'critical' | 'moderate',
    html: string,
    tags: ('wcag2a' | 'wcag2aa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa')[]
) => {
    return {
        id,
        impact,
        help,
        helpUrl,
        nodes: [
            {
                html,
                failureSummary: `Fix any of the following:\n• The page must contain at least one ${id}`,
            },
        ],
        tags,
    }
}

export const runAxeAudit = (currentPath: string, errorList: string[]) => {
    cy.injectAxe()

    cy.checkA11y(
        undefined,
        {
            runOnly: {
                type: 'tag',
                values: [
                    'wcag2a',
                    'wcag2aa',
                    'wcag21a',
                    'wcag21aa',
                    'wcag22aa',
                ],
            },
            includedImpacts: ['critical', 'serious', 'moderate'],
        },
        (violations) => {
            processViolations(currentPath, violations, errorList)
        },
        true
    )

    checkManualButtons((manualViolations) => {
        processViolations(currentPath, manualViolations, errorList)
    })
}

const processViolations = (
    currentPath: string,
    violations: any[],
    errorList: string[]
) => {
            violations.forEach((violation) => {
                const nodes = violation.nodes.length
                const tags =
                    violation.tags
                .filter((tag: string) => /^wcag/i.test(tag))
                .map((tag: string) => formatWCAGTag(tag))
                        .join(', ') || 'no WCAG reference'

                const affectedElements = violation.nodes
                    .map(
                (node: any) =>
                            `\n\nElement: ${node.html}\n${node.failureSummary?.replace(/\n\s/g, '\n•')}`
                    )
                    .join('\n')

                const message =
                    `on [${currentPath}]: [${tags}] (${violation.impact} severity / ${nodes} element${nodes !== 1 ? 's' : ''} affected): ${violation.help}.` +
                    `${affectedElements}\n` +
                    `\nHelp: ${violation.helpUrl}`
                errorList.push(message)
            })
        },
        false // test does not fail on accessibility violations
    )
    checkManualButtons(currentPath, errorList)
}

const checkManualButtons = (callback: (violations: any[]) => void) => {
    cy.get('body').then((body) => {
        const buttons = body.find('button')
        if (buttons.length === 0) {
            const manualViolation = createCustomViolation(
                'Placeholder - - - button',
                'Placeholder - - - Page must have at least one button',
                'Placeholder - - - https://www.w3.org/',
                'serious',
                'Placeholder - - - <body>',
                ['wcag2aa']
            )
            callback([manualViolation])
        }
    })
}
