import { test, expect } from '@playwright/test';

test('карусель переключает разрезы кнопками и свайпом', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Деньги группы' });
  await expect(hero.getByText('АО «УК Холдинг»')).toBeVisible();
  await page.getByRole('button', { name: 'Банки', exact: true }).click();
  await expect(hero.getByText('Альфа-Банк')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Банки', exact: true })).toHaveAttribute('aria-current', 'true');
  const card = hero.locator('.hero__card');
  const box = await card.boundingBox();
  if (!box) throw new Error('Карточка не найдена');
  await page.mouse.move(box.x + box.width * .8, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .2, box.y + 80, { steps: 8 });
  await page.mouse.up();
  await expect(hero.getByText('CNY')).toBeVisible();
  await page.getByRole('button', { name: 'Юрлица', exact: true }).click();
  await expect(hero.getByText('ООО «Порт»')).toBeVisible();
});
