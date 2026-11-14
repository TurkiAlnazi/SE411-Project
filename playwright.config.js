import { defineConfig } from '@playwright/test'

const browserPath = process.env.FLEETLINE_CHROMIUM_PATH

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:15173',
    channel: !browserPath && process.platform === 'win32' ? 'msedge' : undefined,
    launchOptions: browserPath ? { executablePath: browserPath } : undefined,
    viewport: { width: 1440, height: 1100 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'java -jar backend/target/fleetline-backend-1.0.0.jar --server.port=18080',
      url: 'http://127.0.0.1:18080/api/cars/summary',
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 15173 --strictPort',
      env: { FLEETLINE_API_URL: 'http://127.0.0.1:18080' },
      url: 'http://127.0.0.1:15173',
    },
  ],
})
