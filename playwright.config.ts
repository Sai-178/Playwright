import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Overall timeout for each test
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  // Multiple Reporters
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: 'on-failure'
    }],
    ['json', {
      outputFile: 'test-results/test-results.json'
    }],
    ['junit', {
      outputFile: 'test-results/junit.xml'
    }],
    ['allure-playwright']
  ],

  use: {
    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video for failed tests
    video: 'retain-on-failure',

    // Capture trace
    trace: 'on-first-retry',

    // Optional
    actionTimeout: 15000,
    navigationTimeout: 30000,

    ignoreHTTPSErrors: true,

    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Uncomment if needed

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
  ],

  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});