const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',

  // 테스트 타임아웃 설정
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // 실패한 테스트만 재시도
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: 'html',

  // 모든 프로젝트에 공통으로 적용되는 설정
  use: {
    // 액션 타임아웃
    actionTimeout: 0,

    // 스크린샷 및 비디오 설정
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Trace 설정 (디버깅용)
    trace: 'on-first-retry',
  },

  // 브라우저 프로젝트 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Firefox와 Safari는 필요시 주석 해제
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 로컬 개발 서버 설정 (필요시)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
