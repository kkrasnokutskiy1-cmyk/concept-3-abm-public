import { expect, test } from "@playwright/test"

test("первый экран не меняется визуально", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "webkit-393", "Эталон зафиксирован в исходном viewport Figma")

  await page.goto("/?version=prev")
  // прежний прототип грузится отдельным чанком — ждём, пока он отрисуется
  await page.locator(".phone-shell").waitFor()
  await expect(page).toHaveScreenshot("first-screen.png", {
    animations: "disabled",
    scale: "css",
  })
})
