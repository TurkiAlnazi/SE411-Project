import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// React uses relative /api URLs. Vite forwards them to the local Java server.
const proxy = { '/api': process.env.FLEETLINE_API_URL || 'http://127.0.0.1:8080' }

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    clearMocks: true,
  },
})
