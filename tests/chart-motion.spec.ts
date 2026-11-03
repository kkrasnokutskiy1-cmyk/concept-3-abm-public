import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

// Проверяем production-сборку без дополнительного сервера и занятого порта.
test.beforeEach(async ({ page }) => {
  await page.route('http://motion.test/**', async (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = resolve('dist', path === '/' ? 'index.html' : `.${path}`);
    if (!file.startsWith(`${resolve('dist')}/`)) return route.abort();
    const types: Record<string, string> = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
    };
    await route.fulfill({ body: await readFile(file), contentType: types[extname(file)] ?? 'application/octet-stream' });
  });
});

async function open(page: Page, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
  await page.emulateMedia({ reducedMotion });
  await page.goto('http://motion.test/');
}

async function scaleY(bar: Locator) {
  return bar.evaluate(node => node.getBoundingClientRect().height / (node as HTMLElement).offsetHeight);
}

async function top(page: Page) {
  await page.evaluate(() => {
    document.querySelector('.app')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

for (const width of [393, 1280]) {
  test(`график ждёт чтения, переживает быстрый пролист и раскрывается плавно — ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 393 ? 852 : 1000 });
    await open(page);
    const chart = page.locator('.bars');
    const bar = chart.locator('.bars__bar').first();
    expect(await scaleY(bar)).toBe(0);
    await chart.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(120);
    await top(page);
    await page.waitForTimeout(500);
    expect(await scaleY(bar)).toBe(0);

    const samples = await chart.evaluate(async node => {
      node.scrollIntoView({ block: 'center', behavior: 'instant' });
      const bar = node.querySelector<HTMLElement>('.bars__bar')!;
      const start = performance.now();
      const frames: { time: number; scale: number }[] = [];
      return new Promise<typeof frames>((done) => {
        const sample = () => {
          const time = performance.now() - start;
          frames.push({ time, scale: bar.getBoundingClientRect().height / bar.offsetHeight });
          if (time >= 1800) done(frames);
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
    });
    expect(samples.filter(frame => frame.time < 250).every(frame => frame.scale === 0)).toBeTruthy();
    expect(samples.some(frame => frame.time > 450 && frame.time < 900 && frame.scale > 0.1 && frame.scale < 0.95)).toBeTruthy();
    expect(samples.at(-1)!.scale).toBeCloseTo(1, 2);
    await top(page);
    await chart.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    expect(await scaleY(bar)).toBeCloseTo(1, 2);
  });
}

test('уменьшенная анимация сразу показывает графики, Star остаётся статичным', async ({ page }) => {
  await open(page, 'reduce');
  expect(await scaleY(page.locator('.bars__bar').first())).toBe(1);
  await expect(page.locator('.limit__used')).toHaveCSS('transform', 'none');
  await expect(page.locator('.hero__bar-seg').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.scenarios__grid i').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.fx-star__layer').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.fx-star__layer').first()).toHaveCSS('opacity', '0.7');
});

test('подушка показывает лимит и сценарии, возвращение предложения не прячет графики', async ({ page }) => {
  await open(page);
  const section = page.locator('.cushion');
  await section.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(section.locator('.limit__used')).toHaveCSS('transform', 'none');
  await expect(section.locator('.scenarios__grid i').last()).toHaveCSS('opacity', '1');
  await section.getByRole('button', { name: 'Не актуально', exact: true }).click();
  await section.locator('.lower-dismiss-reasons button').first().click();
  await section.getByRole('button', { name: 'Вернуть', exact: true }).click();
  await expect(section.locator('.limit__used')).toHaveCSS('transform', 'none');
  await expect(section.locator('.scenarios__grid i').last()).toHaveCSS('opacity', '1');
});

test('Star переливается в видимой карточке и приостанавливается вне экрана', async ({ page }, testInfo) => {
  await open(page);
  const note = page.locator('.mf-insight .note');
  const layer = note.locator('.fx-star__layer');
  await expect(layer).toHaveCSS('animation-play-state', 'paused');
  await note.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(layer).toHaveCSS('animation-play-state', 'running');
  await expect(layer.locator('img')).toHaveCSS('filter', 'none');
  await expect(page.locator('[data-node-id="3930:213253"]')).toHaveCSS('opacity', '1');
  const before = await layer.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(300);
  expect(await layer.evaluate(node => getComputedStyle(node).transform)).not.toBe(before);

  // Два положения для проверки, что текст/границы сохраняются при переливе.
  for (const time of [0, 3500]) {
    await layer.evaluate((node, time) => {
      const animation = node.getAnimations()[0];
      animation.pause();
      animation.currentTime = time;
    }, time);
    await note.screenshot({ path: testInfo.outputPath(`star-${time}.png`), animations: 'allow' });
  }
  await top(page);
  await expect(layer).toHaveCSS('animation-play-state', 'paused');
});

test('Star в нижних карточках запускается через обёртку display:contents', async ({ page }) => {
  await open(page);
  const card = page.locator('#key-rate-impact .lower-card');
  await card.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  for (const layer of await card.locator('.fx-star__layer').all()) {
    await expect(layer).toHaveCSS('animation-play-state', 'running');
  }
});
