export const applyGlobalStorage = (
    win: Cypress.AUTWindow,
    globalStorage: any
) => {
    if (!globalStorage || !globalStorage.data) {
        return
    }

    try {
        const storage =
            globalStorage.type === 'sessionStorage'
                ? win.sessionStorage
                : win.localStorage

        Object.entries(globalStorage.data).forEach(([key, value]) => {
            const stringValue =
                typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value)

            storage.setItem(key, stringValue)
        })
    } catch (error: any) {
        cy.task('log', `Global State Injection Failed: ${error.message}`)
    }
}
