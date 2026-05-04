import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        allowCypressEnv: false,
        baseUrl: 'http://localhost:5173',
    },
})
