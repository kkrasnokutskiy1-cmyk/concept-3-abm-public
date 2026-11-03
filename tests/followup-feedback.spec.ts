import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});

test('дефицит выделен красным с фоном 4%, запас возвращает нейтральное оформление', async ({ page }) => {
  const section = page.locator('[data-node-id="3930:213306"]');
  const gap = section.locator('.cod-gap');
  const slider = section.getByRole('slider', { name: 'Дата прогноза' });
  const checkDeficit = async () => {
    await expect(gap).toContainText('Дефицит по P10');
    await expect(gap).toHaveCSS('background-color', 'rgba(231, 0, 11, 0.04)');
    for (const paragraph of await gap.locator('p').all()) {
      await expect(paragraph).toHaveCSS('color', 'rgb(231, 0, 11)');
    }
  };
  await checkDeficit();
  await slider.press('Home');
  await expect(gap).toContainText('Запас по P10');
  await expect(gap).toHaveCSS('background-color', 'rgba(24, 24, 27, 0.04)');
  await expect(gap.locator('.deficit__value')).toHaveCSS('color', 'rgb(24, 24, 27)');
  await slider.press('End');
  await checkDeficit();
});

test('подушка повторяет отказ зарплатного дня: отмена, причина, скрытие и возврат', async ({ page }) => {
  const cushion = page.locator('[data-node-id="3930:213419"]');
  const payroll = page.locator('#payroll-day');
  const dismiss = cushion.getByRole('button', { name: 'Не актуально', exact: true });
  await dismiss.click();
  const reasons = cushion.getByRole('group', { name: 'Почему не актуально' });
  await expect(reasons).toBeVisible();
  await payroll.getByRole('button', { name: 'Не актуально', exact: true }).click();
  expect(await reasons.getByRole('button').allTextContents()).toEqual(
    await payroll.getByRole('group', { name: 'Почему не актуально' }).getByRole('button').allTextContents(),
  );
  await reasons.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(dismiss).toBeVisible();
  await dismiss.click();
  await reasons.getByRole('button', { name: 'Не сейчас', exact: true }).click();
  await expect(cushion.getByRole('status')).toHaveText('Предложение скрыто. Его можно вернуть ниже.');
  await expect(cushion.getByText('Скрыли · не сейчас')).toBeVisible();
  await expect(cushion.getByRole('button', { name: 'Подключить подушку' })).toHaveCount(0);
  await expect(cushion.getByText('Возможный разрыв 18 ноя')).toHaveCount(0);
  await cushion.getByRole('button', { name: 'Вернуть', exact: true }).click();
  await expect(cushion.getByRole('button', { name: 'Подключить подушку' })).toBeVisible();
  await expect(cushion.getByText('Возможный разрыв 18 ноя')).toBeVisible();
  await dismiss.click();
  await reasons.getByRole('button', { name: 'Расчёт неверный', exact: true }).click();
  await page.reload();
  await expect(cushion.getByRole('button', { name: 'Подключить подушку' })).toBeVisible();
});

test('два главных различия занимают всю ширину содержимого карточки', async ({ page }) => {
  for (const width of [320, 393, 430, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    const section = page.locator('#month-over-month');
    await section.scrollIntoViewIfNeeded();
    const rows = await section.locator('.lower-differences li').evaluateAll(items => items.map(item => {
      const row = item.getBoundingClientRect();
      const number = item.querySelector('.lower-difference-number')!.getBoundingClientRect();
      const chevron = item.querySelector('.lower-chevron')!.getBoundingClientRect();
      const card = item.closest('.lower-card')!;
      const cardBox = card.getBoundingClientRect();
      const cardStyle = getComputedStyle(card);
      return {
        leftGap: number.left - (cardBox.left + parseFloat(cardStyle.paddingLeft)),
        rightGap: cardBox.right - parseFloat(cardStyle.paddingRight) - chevron.right,
        overflows: item.scrollWidth > row.width + 1,
      };
    }));
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(Math.abs(row.leftGap)).toBeLessThan(1);
      expect(Math.abs(row.rightGap)).toBeLessThan(1);
      expect(row.overflows).toBe(false);
    }
  }
});
