import { test, expect, type Page } from '@playwright/test';

// Конфиг по умолчанию гасит анимации — здесь проверяем сам переход
test.use({ reducedMotion: 'no-preference' });

/** Покадрово (rAF, ~0.9 с): наибольшая итоговая непрозрачность среди карточек дел */
const sampleFrames = (page: Page) => page.evaluate(() => new Promise<number[]>((resolve) => {
  const section = document.querySelector('[data-node-id="3930:213001"]')!;
  const frames: number[] = [];
  const start = performance.now();
  const tick = () => {
    let best = 0;
    section.querySelectorAll('.tasks__card').forEach((card) => {
      let opacity = 1;
      for (let n: Element | null = card; n && n !== section; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      best = Math.max(best, opacity);
    });
    frames.push(best);
    if (performance.now() - start < 900) requestAnimationFrame(tick); else resolve(frames);
  };
  requestAnimationFrame(tick);
}));

test('шеврон «Дела в работе»: ни одного кадра без карточек при раскрытии и сворачивании', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('[data-node-id="3930:213001"]');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveCSS('opacity', '1');
  const toggle = section.locator('.tasks-stack-toggle');

  for (const expanded of ['true', 'false']) {
    const frames = sampleFrames(page);
    await toggle.click();
    expect(Math.min(...(await frames))).toBeGreaterThan(0.95);
    await expect(toggle).toHaveAttribute('aria-expanded', expanded);
  }
  // После сворачивания — снова стопка с одной передней карточкой
  await expect(section.locator('[data-task-id]')).toHaveCount(1);
  await expect(section.locator('.fx-card-stack__back')).toHaveCount(2);
});
