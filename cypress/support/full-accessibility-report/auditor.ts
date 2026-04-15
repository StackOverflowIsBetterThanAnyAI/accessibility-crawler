import { formatWCAGTag } from './format-wcag-tag'

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

const checkManualButtons = (currentPath: string, errorList: string[]) => {
    cy.get('body').then((body) => {
        const buttons = body.find('button')
        if (buttons.length === 0) {
            errorList.push(
                `on [${currentPath}]: [WCAG 1.2 AAA Success Criterion 3.4.5] (serious severity / 1 element affected): No buttons found on the page.`
            )
        }
    })
}
