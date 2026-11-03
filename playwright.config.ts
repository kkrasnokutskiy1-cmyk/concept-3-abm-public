import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT || process.env.VIBEFORGE_SESSION_PORT || 4791);

// tests/*.spec.ts — новый экран «Main-full» (3892:211565) на «/»;
// tests/e2e/*.spec.ts — прежний прототип (3892:210354) на «/?version=prev».
// tests/*.test.ts — unit-тесты vitest, Playwright их не запускает.
const LEGACY = 'e2e/**/*.spec.ts';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      testIgnore: LEGACY,
      use: {
        ...devices['iPhone 15 Pro'],
        browserName: 'chromium',
        defaultBrowserType: 'chromium',
        // Ширина базового фрейма Figma «Main-full»
        viewport: { width: 393, height: 852 },
        // Анимации появления сразу в финальном состоянии — сверяем статичную вёрстку
        reducedMotion: 'reduce',
      },
    },
    { name: 'webkit-393', testMatch: LEGACY, use: { ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 } } },
    { name: 'chromium-320', testMatch: LEGACY, use: { browserName: 'chromium', viewport: { width: 320, height: 700 } } },
    { name: 'chromium-430', testMatch: LEGACY, use: { browserName: 'chromium', viewport: { width: 430, height: 932 } } },
    { name: 'firefox-393', testMatch: LEGACY, use: { browserName: 'firefox', viewport: { width: 393, height: 852 } } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
