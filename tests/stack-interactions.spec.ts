import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

// Автономная проверка production-сборки без прослушивания дополнительного порта.
test.beforeEach(async ({ page }) => {
  if (process.env.STACK_OFFLINE_PREVIEW === '1') {
    await page.route('http://stack.test/**', async (route) => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      const file = resolve('dist', pathname === '/' ? 'index.html' : `.${pathname}`);
      if (!file.startsWith(`${resolve('dist')}/`)) return route.abort();
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
      try { await route.fulfill({ body: await readFile(file), contentType: types[extname(file)] ?? 'application/octet-stream' }); }
      catch { await route.fulfill({ status: 404, body: 'Not found' }); }
    });
  }
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

const decisions = (page: Page) => page.locator('[data-node-id="3930:212961"]');
const tasks = (page: Page) => page.locator('[data-node-id="3930:213001"]');

async function touchDrag(page: Page, card: Locator, dx: number, dy = 0, cancel = false) {
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  const x = box.x + (dx < 0 ? box.width * 0.6 : box.width * 0.25);
  const y = box.y + 35;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 6, y: y + dy * step / 6 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test('Внимание раскрывает четыре оси и причины; состояние можно свернуть', async ({ page }) => {
  const banner = page.locator('[data-node-id="3930:212950"]');
  const toggle = banner.getByRole('button', { name: /Внимание/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(banner.locator('.risk-axis')).toHaveCount(4);
  await banner.getByRole('button', { name: /Ковенанты/ }).click();
  await expect(banner.getByText(/Прогноз DSCR на тест/)).toBeVisible();
  await banner.getByRole('button', { name: /Ликвидность/ }).click();
  await expect(banner.getByText(/Прогноз DSCR на тест/)).toBeHidden();
  await expect(banner.getByText(/Остаток 12,84 млрд/)).toBeVisible();
  await page.setViewportSize({ width: 320, height: 852 });
  expect(await banner.evaluate((n) => n.scrollWidth <= n.clientWidth)).toBeTruthy();
  await toggle.click();
  await expect(banner.locator('.risk-axes')).toBeHidden();
});

test('свайп решения откладывает и позволяет вернуть; свайп вправо не подписывает', async ({ page }) => {
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await touchDrag(page, front, 125);
  await expect(section.locator('[data-decision-id="d-p1"]')).toBeVisible();
  await touchDrag(page, front, -130, 0, true);
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await touchDrag(page, front, -160);
  await expect(section.locator('.fx-badge')).toHaveText('4');
  await expect(section.getByRole('status')).toContainText('Отложено до завтра');
  await expect(section.locator('[data-decision-id="d-fx"]')).toBeVisible();
  // Вторая карточка повторяет структуру первой: подпись-заголовок и крупная строка
  await expect(section.locator('[data-decision-id="d-fx"] h3')).toHaveText('Документы по контракту CN-2291');
  await expect(section.locator('[data-decision-id="d-fx"] .fx-amount__value')).toHaveText('Акт приёмки');
  await section.getByRole('button', { name: 'Вернуть' }).click();
  await expect(section.locator('[data-decision-id="d-p1"]')).toBeVisible();
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await expect(front).toBeFocused();
});

test('подпись требует двух нажатий; кнопку нельзя случайно превратить в свайп', async ({ page }) => {
  const section = decisions(page);
  await section.getByRole('button', { name: 'Подписать', exact: true }).click();
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await section.getByRole('button', { name: 'Подтвердить 184 млн ₽' }).click();
  await expect(section.locator('.fx-badge')).toHaveText('4');
  await expect(section.getByRole('status')).toContainText('Подписано');
  await section.getByRole('button', { name: 'Вернуть' }).click();
  await expect(section.getByRole('button', { name: 'Подписать', exact: true })).toBeVisible();
});

test('вертикальный жест прокручивает страницу и не убирает решение', async ({ page }) => {
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await touchDrag(page, front, -12, -125);
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
});

test('очередь заканчивается без пустых полос и восстанавливается кнопкой Вернуть', async ({ page }) => {
  const section = decisions(page);
  for (let i = 0; i < 5; i++) await section.getByRole('button', { name: 'Отложить', exact: true }).click();
  await expect(section.locator('.fx-badge')).toHaveText('0');
  await expect(section.getByText('Всё решено · следующая проверка 14:00')).toBeVisible();
  await expect(section.locator('.fx-card-stack__back')).toHaveCount(0);
  await section.getByRole('button', { name: 'Вернуть' }).click();
  await expect(section.locator('.fx-badge')).toHaveText('1');
  await expect(section.locator('[data-decision-id="d-limit"]')).toBeVisible();
});

test('дела листаются в обе стороны; напоминание сохраняется и отменяется', async ({ page }) => {
  const section = tasks(page);
  const front = section.locator('.fx-card-stack__front');
  await section.getByRole('button', { name: 'Напомнить' }).click();
  await expect(section.getByRole('status')).toHaveText('Напомнили · ответ придёт сюда');
  await touchDrag(page, front, -160);
  await expect(section.locator('[data-task-id="c-sign"]')).toBeVisible();
  await touchDrag(page, front, 160);
  await expect(section.locator('[data-task-id="c-credit"]')).toBeVisible();
  await expect(section.getByRole('status')).toHaveText('Напомнили · ответ придёт сюда');
  await section.getByRole('button', { name: 'Отменить' }).click();
  await expect(section.getByRole('status')).toHaveCount(0);
  await front.focus();
  await page.keyboard.press('ArrowRight');
  await expect(section.locator('[data-task-id="c-fx"]')).toBeVisible();
  await expect(front).toBeFocused();
  await section.getByRole('button', { name: 'Открыть', exact: true }).click();
  await expect(section.getByText('Сбор документов · В работе', { exact: true })).toBeVisible();
});

test('шеврон раскрывает все дела списком и сворачивает обратно в стопку', async ({ page }) => {
  const section = tasks(page);
  const toggle = section.getByRole('button', { name: 'Показать все дела' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(section.locator('[data-task-id]')).toHaveCount(1);
  await toggle.click();
  await expect(section.getByRole('button', { name: 'Свернуть дела в стопку' })).toHaveAttribute('aria-expanded', 'true');
  for (const id of ['c-credit', 'c-sign', 'c-fx']) await expect(section.locator(`[data-task-id="${id}"]`)).toBeVisible();
  await expect(section.locator('.fx-card-stack__back')).toHaveCount(0);
  await section.getByRole('button', { name: 'Свернуть дела в стопку' }).click();
  await expect(section.locator('[data-task-id]')).toHaveCount(1);
  await expect(section.locator('.fx-card-stack__front')).toBeVisible();
});

test('исходная геометрия стопок: две полосы ниже карточки, нажатия не перекрыты', async ({ page }, testInfo) => {
  // Фиксированная навигация не является частью эталона отдельной секции.
  await page.addStyleTag({ content: '.lower-bottom-bar { visibility: hidden !important; }' });
  for (const [id, height] of [['3930:212950', 108], ['3930:212961', 310], ['3930:213001', 246]] as const) {
    const node = page.locator(`[data-node-id="${id}"]`).first();
    expect(Math.abs((await node.boundingBox())!.height - height)).toBeLessThanOrEqual(1);
    await node.screenshot({ path: testInfo.outputPath(`${id.replace(':', '-')}.png`), animations: 'disabled', scale: 'css' });
  }
  for (const section of [decisions(page), tasks(page)]) {
    await section.scrollIntoViewIfNeeded();
    const geometry = await section.evaluate((node) => {
      const front = node.querySelector('.fx-card-stack__front')!;
      const backs = [...node.querySelectorAll<HTMLElement>('.fx-card-stack__back')];
      const card = front.getBoundingClientRect();
      const [first, second] = backs.map((back) => back.getBoundingClientRect());
      // Видимая часть задней карточки начинается по обрезке clip-path
      const clipTop = (back: HTMLElement) => Number(/inset\(([-\d.]+)px/.exec(getComputedStyle(back).clipPath)?.[1] ?? NaN);
      const visibleTop = (back: HTMLElement, rect: DOMRect) => rect.top + clipTop(back) * (rect.height / back.offsetHeight);
      const hit = document.elementFromPoint(card.x + card.width / 2, card.bottom - 3);
      return {
        edges: [first.bottom - card.bottom, second.bottom - card.bottom],
        overlap: card.bottom - visibleTop(backs[0], first),
        frontIsAbove: front.contains(hit),
        backInert: backs.every((back) => getComputedStyle(back).pointerEvents === 'none' && back.inert),
      };
    });
    expect(geometry.edges[0]).toBeCloseTo(9, 0);
    expect(geometry.edges[1]).toBeCloseTo(16, 0);
    // Задние карточки не заходят под полупрозрачную переднюю
    expect(Math.abs(geometry.overlap)).toBeLessThanOrEqual(0.5);
    expect(geometry.frontIsAbove).toBeTruthy();
    expect(geometry.backInert).toBeTruthy();
  }
});

test('перетаскивание мышью с анимацией; короткий жест возвращает карточку', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  await expect(section).toHaveCSS('opacity', '1');
  const box = (await front.boundingBox())!;
  const x = box.x + 220, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 15, y, { steps: 4 });
  await page.mouse.up();
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await expect(front).toHaveCSS('transform', 'none');
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 150, y, { steps: 8 });
  await page.mouse.up();
  await expect(section.locator('.fx-badge')).toHaveText('4');
  await expect(front).toHaveCSS('transform', 'none');
});

test('стопки остаются в границах экрана при ширине 320–430', async ({ page }) => {
  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 852 });
    for (const section of [decisions(page), tasks(page)]) {
      const geometry = await section.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        const layers = [...node.querySelectorAll('.fx-card-stack__front, .fx-card-stack__back')].map((n) => n.getBoundingClientRect());
        return { fits: layers.every((r) => r.left >= bounds.left && r.right <= bounds.right), overflow: node.scrollWidth - node.clientWidth };
      });
      expect(geometry.fits).toBeTruthy();
      expect(geometry.overflow).toBe(0);
    }
  }
});

test('подсказка объясняет действие, стекло и blur исчезают после отмены', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await front.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(section).toHaveCSS('opacity', '1');
  const box = (await front.boundingBox())!;
  const x = box.x + 220, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 110, y, { steps: 6 });
  const hint = section.locator('.fx-card-stack__hint');
  await expect(hint).toHaveText('←Отложить до завтра');
  await expect(hint).toHaveCSS('opacity', '1');
  expect(await front.evaluate((node) => getComputedStyle(node).filter)).toMatch(/blur\(/);
  await section.screenshot({ path: testInfo.outputPath('decision-swipe-midpoint.png') });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(front).toHaveCSS('transform', 'none');
  await expect(front).toHaveCSS('filter', 'none');
  await expect(hint).toHaveCSS('opacity', '0');
  await expect(section.locator('.fx-badge')).toHaveText('5');
});

test('возврат в противоположную сторону отменяет откладывание даже за порогом', async ({ page }) => {
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  const box = (await front.boundingBox())!;
  const x = box.x + 240, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 160, y, { steps: 6 });
  // Пауза отделяет первоначальный drag от явного движения обратно.
  await page.waitForTimeout(130);
  await page.mouse.move(x - 135, y);
  await page.mouse.move(x - 100, y);
  await page.mouse.up();
  await expect(section.locator('.fx-badge')).toHaveText('5');
  await expect(front).toHaveCSS('transform', 'none');
});

test('повторный захват останавливает возврат в текущей позиции', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const section = decisions(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  await expect(section).toHaveCSS('opacity', '1');
  const box = (await front.boundingBox())!;
  const x = box.x + 220, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 70, y, { steps: 4 });
  await page.waitForTimeout(130);
  await page.mouse.up();
  await page.mouse.down();
  // MotionValue и DOM обновляются в разных фазах rAF: измеряем остановленный кадр.
  const stoppedAt = await front.evaluate((node) => new Promise<number>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(new DOMMatrixReadOnly(getComputedStyle(node).transform).m41)));
  }));
  expect(stoppedAt).toBeLessThan(-5);
  await page.mouse.move(x - 82, y);
  await expect.poll(() => front.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41))
    .toBeCloseTo(stoppedAt - 12, 0);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(section.locator('.fx-badge')).toHaveText('5');
});

test('быстрый короткий свайп после удержания учитывает скорость отпускания', async ({ page }) => {
  const section = tasks(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  const box = (await front.boundingBox())!;
  const x = box.x + 220, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(x - 20, y);
  await page.mouse.move(x - 55, y);
  await page.mouse.up();
  await expect(section.locator('[data-task-id="c-sign"]')).toBeVisible();
});

test('reduced motion оставляет карточки резкими и сохраняет свайп', async ({ page }) => {
  const section = tasks(page);
  const front = section.locator('.fx-card-stack__front');
  await front.scrollIntoViewIfNeeded();
  const box = (await front.boundingBox())!;
  const x = box.x + 220, y = box.y + 45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 120, y, { steps: 4 });
  await expect(front).toHaveCSS('filter', 'none');
  await expect(front).toHaveCSS('opacity', '1');
  await expect(section.locator('.fx-card-stack__back--1')).toHaveCSS('filter', 'none');
  await page.mouse.up();
  await expect(section.locator('[data-task-id="c-sign"]')).toBeVisible();
});
