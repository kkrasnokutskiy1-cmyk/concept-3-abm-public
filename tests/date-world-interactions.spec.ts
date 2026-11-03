import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('«Деньги на дату»: перетаскивание меняет дату, сумму, точки и запас по P10', async ({ page }) => {
  const section = page.locator('section[data-node-id="3930:213306"]');
  const slider = section.getByRole('slider', { name: 'Дата прогноза' });
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toHaveAttribute('aria-valuetext', '18 ноя');
  await expect(section.locator('.fx-amount__value')).toHaveText('9,2 млрд');
  await expect(section.locator('.deficit')).toContainText('Дефицит по P10');

  const dot = section.locator('.chart__cursor').first();
  const before = await dot.boundingBox();
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.27, box.y + 3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.58, box.y + 3, { steps: 8 });
  await page.mouse.up();

  // 16 дек: 12 + 23·7 = 173 / 300 ≈ 0.577
  await expect(slider).toHaveAttribute('aria-valuetext', '16 дек');
  await expect(section.locator('.cod-nav__date')).toHaveText('16 дек');
  await expect(section.locator('.fx-amount__value')).toHaveText('10,1 млрд');
  await expect(section.locator('.deficit')).toContainText('Запас по P10');
  await expect(section.locator('.deficit__value')).toHaveText('0,10 млрд ₽');
  const after = await dot.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 50);
});

test('«Деньги на дату»: стрелки и клавиатура листают даты в пределах прогноза', async ({ page }) => {
  const section = page.locator('section[data-node-id="3930:213306"]');
  const prev = section.getByRole('button', { name: 'Предыдущая дата' });
  await prev.scrollIntoViewIfNeeded();
  await prev.click();
  await prev.click();
  await prev.click();
  await expect(section.locator('.cod-nav__date')).toHaveText('28 окт');
  await expect(prev).toBeDisabled();
  const slider = section.getByRole('slider', { name: 'Дата прогноза' });
  await slider.focus();
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuetext', '20 янв');
  await expect(section.getByRole('button', { name: 'Следующая дата' })).toBeDisabled();
});

test('«Мир вокруг вас»: строка, стрелки и свайп меняют событие; контроль можно вернуть', async ({ page }) => {
  const section = page.locator('section[data-node-id="3930:213032"]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('.world__count')).toHaveText('1/5');
  await expect(section.locator('.world__tag')).toHaveText('ваш импорт');

  await section.getByRole('button', { name: /^Закон/ }).click();
  await expect(section.locator('.world__count')).toHaveText('3/5');
  await expect(section.getByRole('button', { name: /^Закон/ })).toHaveAttribute('aria-pressed', 'true');

  await section.getByRole('button', { name: 'Следующее событие' }).click();
  await expect(section.locator('.world__tag')).toHaveText('ваша дебиторка');

  const card = section.locator('.world__event');
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(section.locator('.world__count')).toHaveText('5/5');

  await section.getByRole('button', { name: 'Взять на контроль' }).click();
  await expect(section.getByText('На контроле')).toBeVisible();
  await section.getByRole('button', { name: 'Вернуть' }).click();
  await expect(section.getByRole('button', { name: 'Взять на контроль' })).toBeVisible();
});

test('«Прогноз остатка»: пояснение раскрывается и сворачивается', async ({ page }) => {
  const section = page.locator('section[data-node-id="3930:213362"]');
  const more = section.getByRole('button', { name: 'Как считается прогноз' });
  await more.scrollIntoViewIfNeeded();
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(section.getByText('по политике казначейства')).toBeVisible();
  await more.click();
  await expect(section.getByText('по политике казначейства')).toHaveCount(0);
});
