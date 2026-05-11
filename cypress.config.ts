/// <reference types="node" />
import { defineConfig } from 'cypress'
import * as fs from 'fs'

export default defineConfig({
    e2e: {
        allowCypressEnv: false,
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, _config) {
            on('task', {
                checkIfFileExists(path: string) {
                    return fs.existsSync(path)
                },
            })
        },
    },
})
