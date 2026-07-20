export const waitForElementsToStabilize = (
    selector: string,
    maxTimeout = 3000,
    idleThreshold = 600
) => {
    const checkInterval = 150
    let lastCount = -1
    let timeStable = 0
    let elapsed = 0

    const check = () => {
        cy.get('body', { log: false }).then(($body) => {
            const currentCount = $body.find(selector).length

            if (currentCount === lastCount && currentCount) {
                timeStable += checkInterval
            } else {
                timeStable = 0
                lastCount = currentCount
            }

            elapsed += checkInterval

            const isStable = timeStable >= idleThreshold
            const hasTimeout = elapsed >= maxTimeout

            if (!isStable && !hasTimeout) {
                cy.wait(checkInterval, { log: false })
                check()
            }
        })
    }

    check()
}
