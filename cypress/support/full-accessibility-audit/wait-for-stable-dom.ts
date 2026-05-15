export const waitForStableDOM = (maxTimeout = 15000) => {
    const checkInterval = 150
    const stableThreshold = 600
    let elapsed = 0
    let timeStable = 0
    let lastHtml = ''

    const check = () => {
        cy.get('html', { log: false }).then(($html) => {
            const currentHtml = $html.html()

            if (currentHtml === lastHtml) {
                timeStable += checkInterval
            } else {
                timeStable = 0
                lastHtml = currentHtml
            }

            elapsed += checkInterval

            if (timeStable < stableThreshold && elapsed < maxTimeout) {
                cy.wait(checkInterval, { log: false })
                check()
            }
        })
    }

    check()
}
