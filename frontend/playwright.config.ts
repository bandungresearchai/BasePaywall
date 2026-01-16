import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://localhost:3001',
    actionTimeout: 5000,
    navigationTimeout: 10000,
  },
  timeout: 30000,
});
