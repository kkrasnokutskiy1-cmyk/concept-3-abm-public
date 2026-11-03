import { test, expect, type Page } from '@playwright/test';

const scrollBy = (page: Page, dy: number) => page.evaluate((d) => window.scrollBy(0, d), dy);
const timeTop = (page: Page) => page.locator('.statusbar__time').evaluate((n) => Math.round(n.getBoundingClientRect().top));

test('время закреплено, «Альфа-Интеллект» возвращается при прокрутке вверх и после 1,7 с покоя', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('[data-node-id="3930:212854"]');
  const label = bar.locator('.topbar__ai');
  const top = await timeTop(page);

  await expect(bar).toHaveCSS('position', 'sticky');
  await expect(label).toHaveCSS('opacity', '1');
  const glowClip = await bar.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    const star = node.querySelector('.fx-star')!.getBoundingClientRect();
    // Обрезка — на внутренней поверхности, тень стекла — на внешнем узле (её clip-path не срезает)
    return {
      clipPath: getComputedStyle(node.querySelector('.topbar__surface')!).clipPath,
      outerClip: getComputedStyle(node).clipPath,
      shadow: getComputedStyle(node).boxShadow,
      starExceedsPanel: star.left < bounds.left || star.right > bounds.right || star.bottom > bounds.bottom,
    };
  });
  expect(glowClip.starExceedsPanel).toBe(true);
  expect(glowClip.clipPath).not.toBe('none');
  expect(glowClip.outerClip).toBe('none');
  expect(glowClip.shadow).not.toBe('none');

  for (let i = 0; i < 5; i++) {
    await scrollBy(page, 120);
    await page.waitForTimeout(40);
  }
  await expect(bar).toHaveClass(/topbar--compact/);
  await expect(label).toHaveCSS('opacity', '0');
  expect(await timeTop(page)).toBe(top);

  // Короткая пауза — ещё скрыт: возвращается только после 1,7 с покоя
  await page.waitForTimeout(900);
  await expect(bar).toHaveClass(/topbar--compact/);
  await expect(bar).not.toHaveClass(/topbar--compact/, { timeout: 1800 });
  await expect(label).toHaveCSS('opacity', '1');

  // Вниз — скрыт, сразу вверх — виден, не дожидаясь остановки
  const compactAfter = (dy: number) =>
    page.evaluate(async (d) => {
      window.scrollBy(0, d);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return document.querySelector('.topbar')!.classList.contains('topbar--compact');
    }, dy);
  expect(await compactAfter(200)).toBe(true);
  // Дрожание вверх на пару пикселей не возвращает подпись, осознанная прокрутка — да
  expect(await compactAfter(-8)).toBe(true);
  expect(await compactAfter(-40)).toBe(false);
  expect(await timeTop(page)).toBe(top);
});
