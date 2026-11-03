import { expect, test } from "@playwright/test"

test("первый экран совпадает по структуре и работает", async ({ page }) => {
  await page.goto("/?version=prev")
  await expect(page.locator("header").getByText("Альфа-Интеллект", { exact: true })).toBeVisible()
  await expect(page.locator(".money-value")).toHaveText("12,84 млрд ₽")
  await expect(page.getByRole("heading", { name: "Ждёт вашего решения" })).toBeVisible()

  await page.getByRole("button", { name: /Внимание/ }).click()
  await expect(page.getByText("47 дней запаса")).toBeVisible()

  await page.getByRole("button", { name: "Подписать", exact: true }).click()
  await expect(page.getByRole("button", { name: "Подтвердить", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click()
  await expect(page.getByText("Пополнение ЕНС", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Вернуть", exact: true }).click()
  await expect(page.locator("#decisions").getByText("ООО «Терминал Восток»", { exact: true })).toBeVisible()
})

test("страница не создаёт горизонтальный overflow", async ({ page }) => {
  await page.goto("/?version=prev")
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)
})

test("нижняя навигация возвращает на первый экран", async ({ page }) => {
  await page.goto("/?version=prev")
  await page.getByRole("button", { name: "Все разделы", exact: true }).click()
  await expect.poll(() => page.locator(".dashboard-scroll").evaluate((node) => node.scrollTop)).toBeGreaterThan(0)

  await page.getByRole("button", { name: "Главная", exact: true }).click()
  await expect.poll(() => page.locator(".dashboard-scroll").evaluate((node) => node.scrollTop)).toBe(0)
})

test("длинный экран отрабатывает ключевые состояния", async ({ page }) => {
  await page.goto("/?version=prev")
  const section = (name: string) => page.locator("section.content-section").filter({ has: page.getByRole("heading", { name, exact: true }) })

  const summary = section("Сводка дня")
  await summary.getByRole("button", { name: "Как посчитано", exact: true }).click()
  await expect(summary.getByText(/Остатки 7 банков сверены/)).toBeVisible()
  await summary.getByRole("button", { name: "Что подписать первым?", exact: true }).click()
  await summary.getByRole("button", { name: "Покажи самый рискованный платёж", exact: true }).click()
  await expect(summary.locator(".assistant-input")).toHaveText(/Покажи самый рискованный платёж/)

  const work = section("Дела в работе")
  await work.getByRole("button", { name: "Напомнить", exact: true }).click()
  await expect(work.getByRole("button", { name: "Напомнили", exact: true })).toBeVisible()

  const calendar = section("Платёжный календарь")
  await calendar.getByRole("button", { name: "28", exact: true }).last().click()
  await expect(calendar.getByText("28 ноя", { exact: true })).toBeVisible()

  const finding = section("Находка Альфа-Интеллект")
  await finding.getByRole("button", { name: "Кто платит медленнее", exact: true }).click()
  await expect(finding.getByText("+9 дней", { exact: true })).toBeVisible()

  const cushion = section("Подушка от разрыва")
  await cushion.getByRole("button", { name: "Подключить подушку", exact: true }).click()
  await expect(cushion.getByRole("button", { name: "Отключить подушку", exact: true })).toBeVisible()
  await cushion.getByRole("button", { name: "Не актуально", exact: true }).click()
  await expect(cushion.getByRole("button", { name: "Вернуть предложение", exact: true })).toBeVisible()

  const payment = section("Проверка платежа")
  await payment.getByRole("button", { name: /Получатель, история сумм/ }).click()
  await expect(payment.getByText("Лимит выше порога", { exact: true })).toBeVisible()
  await payment.getByRole("button", { name: "Запросить подтверждение", exact: true }).click()
  await expect(payment.getByRole("button", { name: "Запрос отправлен", exact: true })).toBeDisabled()

  const planFact = section("План-факт")
  await planFact.getByRole("radio", { name: "Поступления", exact: true }).click()
  await expect(planFact.getByRole("radio", { name: "Поступления", exact: true })).toBeChecked()

  const taxes = section("Налоги и ЕНС")
  await taxes.getByRole("button", { name: /Обязательства и сверка/ }).click()
  await expect(taxes.getByText("Сальдо ЕНС", { exact: true })).toBeVisible()
  await taxes.getByRole("button", { name: "Подготовить 22,0 млн ₽", exact: true }).click()
  await expect(taxes.getByRole("button", { name: "Отменить черновик", exact: true })).toBeVisible()

  const cashFlow = section("Движение денег")
  await cashFlow.getByRole("radio", { name: "Год", exact: true }).click()
  await expect(cashFlow.getByRole("radio", { name: "Год", exact: true })).toBeChecked()

  const rate = section("Ставка ЦБ и вы")
  await rate.getByRole("button", { name: "−1 п.п.", exact: true }).click()
  await expect(rate.locator(".big-number")).toContainText("−13,2")

  const payroll = section("Зарплатный день")
  await payroll.getByRole("button", { name: "Посчитать условия", exact: true }).click()
  await expect(payroll.getByRole("button", { name: "Условия рассчитаны", exact: true })).toBeDisabled()
  await payroll.getByRole("button", { name: "Не актуально", exact: true }).click()
  await expect(payroll.getByRole("button", { name: "Вернуть расчёт", exact: true })).toBeVisible()

  const rule = section("Предложенное правило")
  await rule.getByRole("checkbox", { name: "Включить правило", exact: true }).check()
  await expect(rule.getByRole("checkbox", { name: "Правило включено", exact: true })).toBeChecked()
  await rule.getByRole("button", { name: "Порог: 50 млн ₽", exact: true }).click()
  await expect(rule.getByText("Сумма больше 100 млн ₽", { exact: true })).toBeVisible()

  const ahead = section("Что впереди")
  await ahead.getByRole("button", { name: "Подготовить платежи недели", exact: true }).click()
  await expect(ahead.getByRole("button", { name: "Отменить подготовку", exact: true })).toBeVisible()
})
