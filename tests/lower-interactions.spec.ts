import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('лента контрагентов прокручивается с клавиатуры', async ({ page }) => {
  const list = page.getByRole('region', { name: 'Карточки контрагентов, прокручиваются по горизонтали' });
  await list.focus();
  await list.press('ArrowRight');
  await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await list.press('ArrowLeft');
  await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBe(0);
});

test('перетаскивание мышью не блокируется scroll-snap и корректно завершается', async ({ page }) => {
  const list = page.locator('.lower-counterparties');
  await list.scrollIntoViewIfNeeded();
  const rect = await list.boundingBox();
  if (!rect) throw new Error('Лента контрагентов не отображается');
  const startX = rect.x + rect.width - 30;
  const y = rect.y + 30;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 80, y, { steps: 4 });
  await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(50);
  await page.mouse.move(startX - 240, y, { steps: 6 });
  await page.mouse.up();
  await expect(list).not.toHaveAttribute('data-dragging');
  await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
});

test('нижняя панель возвращает в начало с reduced motion', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('button', { name: 'В начало', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('предложение скрывается с причиной, возвращается и сбрасывается после reload', async ({ page }) => {
  const section = page.locator('#payroll-day');
  await section.getByRole('button', { name: 'Не актуально', exact: true }).click();
  await expect(section.getByRole('group', { name: 'Почему не актуально' })).toBeVisible();
  await section.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Не актуально', exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Не актуально', exact: true }).click();
  await section.getByRole('button', { name: 'Не сейчас', exact: true }).click();
  await expect(section.getByRole('status')).toHaveText('Предложение скрыто. Его можно вернуть ниже.');
  await expect(section.getByText('Скрыли · не сейчас')).toBeVisible();
  await section.getByRole('button', { name: 'Вернуть', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Посчитать условия', exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Не актуально', exact: true }).click();
  await section.getByRole('button', { name: 'Расчёт неверный', exact: true }).click();
  await page.reload();
  await expect(section.getByRole('button', { name: 'Посчитать условия', exact: true })).toBeVisible();
});

test('правило включается и выключается без изменения порога', async ({ page }) => {
  const section = page.locator('#suggested-rule');
  await section.getByRole('button', { name: 'Включить правило', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Правило включено', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(section.getByText('Сумма больше 50 млн ₽', { exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Правило включено', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Включить правило', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('периоды меняют суммы, остатки и геометрию движения денег', async ({ page }) => {
  const section = page.locator('#cash-flow');
  const bar = section.locator('.lower-waterfall__track span').nth(1);
  const original = await bar.getAttribute('style');
  for (const [label, period, net, start, inflow] of [
    ['Неделя', '15–21 окт', '+0,74 млрд', '12,10', '+1,62'],
    ['Квартал', 'IV квартал', '+1,89 млрд', '10,95', '+18,30'],
    ['Год', 'С начала года', '+3,04 млрд', '9,80', '+58,40'],
    ['Месяц', 'Октябрь', '+1,12 млрд', '11,72', '+6,40'],
  ]) {
    await section.getByRole('button', { name: label, exact: true }).click();
    await expect(section.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(section.getByText(`${period} · чистый поток`, { exact: true })).toBeVisible();
    await expect(section.locator('.fx-amount__value')).toHaveText(net);
    await expect(section.locator('.lower-waterfall__row').first()).toContainText(start);
    await expect(section.locator('.lower-waterfall__row').nth(1)).toContainText(inflow);
    await expect(section.locator('.lower-waterfall__row').last()).toContainText('12,84');
    if (label !== 'Месяц') expect(await bar.getAttribute('style')).not.toBe(original);
  }
  await expect(bar).toHaveAttribute('style', original!);
});

test('сценарий снижения ставки меняет обе части и пояснение', async ({ page }) => {
  const section = page.locator('#key-rate-impact');
  await section.getByRole('button', { name: '−1 п.п.', exact: true }).click();
  await expect(section.locator('.fx-amount__value')).toHaveText('−13,2 млн');
  await expect(section.getByText('−28,2 млн ₽', { exact: true })).toBeVisible();
  await expect(section.getByText('−15,0 млн ₽', { exact: true })).toBeVisible();
  await expect(section.locator('.lower-explanation__text')).toContainText('Снижение расходов по долгу превышает потерю дохода');
  await section.getByRole('button', { name: '+1 п.п.', exact: true }).click();
  await expect(section.locator('.fx-amount__value')).toHaveText('+13,2 млн');
});

test('план-факт раскрывает исходные суммы и переключает направление', async ({ page }) => {
  const section = page.locator('#plan-fact');
  const taxes = section.getByRole('button', { name: 'Налоги 85,0 млн ₽ выше плана', exact: true });
  await taxes.click();
  await expect(taxes).toHaveAttribute('aria-expanded', 'true');
  await expect(section.getByText('820 млн ₽', { exact: true })).toBeVisible();
  await expect(section.getByText('905 млн ₽', { exact: true })).toBeVisible();
  await taxes.click();
  await expect(section.getByText('820 млн ₽', { exact: true })).toBeHidden();
  await section.getByRole('button', { name: 'Поступления 1', exact: true }).click();
  await expect(section.locator('.lower-deviations > li')).toHaveCount(1);
  await expect(section.getByText('6,10 млрд ₽', { exact: true })).toBeVisible();
  await expect(section.getByText('6,45 млрд ₽', { exact: true })).toBeVisible();
  await expect(section.locator('.fx-amount__value')).toHaveText('+233 млн');
  await section.getByRole('button', { name: 'Расходы 4', exact: true }).click();
  await expect(section.locator('.lower-deviations > li')).toHaveCount(4);
});

test('черновик ЕНС можно подготовить и убрать без изменения баланса', async ({ page }) => {
  const section = page.locator('#taxes-ens');
  await section.getByRole('button', { name: 'Подготовить 22,0 млн ₽', exact: true }).click();
  await expect(section.getByRole('status')).toContainText('Черновик пополнения готов');
  await expect(section.getByRole('status')).toContainText('платёж не отправлен');
  await expect(section.locator('.lower-tax-chart').getByText('52,0 млн ₽', { exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Убрать черновик', exact: true }).click();
  await expect(section.getByRole('status')).toHaveCount(0);
  await expect(section.getByRole('button', { name: 'Подготовить 22,0 млн ₽', exact: true })).toBeVisible();
});

test('проверка платежа раскрывает историю и влияние на лимит', async ({ page }) => {
  const section = page.locator('#payment-check');
  const disclosure = section.getByRole('button', { name: 'Получатель, история сумм, влияние', exact: true });
  await disclosure.click();
  await expect(section.getByText('С нами с', { exact: true })).toHaveCount(0);
  await expect(section.getByText('Оборот 12 мес', { exact: true })).toHaveCount(0);
  await expect(section.getByText('Сумма среди 24 прошлых платежей', { exact: true })).toBeVisible();
  await expect(section.locator('.lower-payment-impact')).toContainText('71% → 89%');
  await disclosure.click();
  await expect(section.locator('.lower-payment-details')).toHaveCount(0);
});

test('зарплатный расчёт проходит проверку условий и обратимый черновик', async ({ page }) => {
  const section = page.locator('#payroll-day');
  await section.getByRole('button', { name: 'Посчитать условия', exact: true }).click();
  await expect(section.getByRole('region', { name: 'Проверка условий' })).toContainText('банки сотрудников');
  await section.getByRole('button', { name: 'Отмена', exact: true }).click();
  await section.getByRole('button', { name: 'Посчитать условия', exact: true }).click();
  await section.getByRole('button', { name: 'Подготовить черновик', exact: true }).click();
  await expect(section.getByRole('status')).toHaveText('Черновик готов в демо. Условия требуют проверки; заявка не отправлена.');
  await section.getByRole('button', { name: 'Удалить черновик', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Посчитать условия', exact: true })).toBeVisible();
});

