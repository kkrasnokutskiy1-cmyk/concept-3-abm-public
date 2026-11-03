import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { FIGMA_BLOCKS, FIGMA_BOTTOM_BAR } from './figma-layout';

const COMPARE_DIR = 'test-results/compare';
const HEIGHT_TOLERANCE = 1;
const Y_TOLERANCE = 2;

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

test('консоль чистая', async ({ page }) => {
  const errors = await open(page);
  expect(errors).toEqual([]);
});

test('геометрия блоков совпадает с Figma (393px)', async ({ page }) => {
  await open(page);
  const problems: string[] = [];

  for (const block of FIGMA_BLOCKS) {
    const el = page.locator(`[data-node-id="${block.id}"]`).first();
    if ((await el.count()) === 0) {
      problems.push(`${block.name} (${block.id}): нет элемента с data-node-id`);
      continue;
    }
    // Меряем раскладку, а не отрисовку: entrance-анимации сдвигают блоки transform'ом
    const box = await el.evaluate((n) => {
      const content = document.querySelector('.app__content');
      let y = 0;
      let cur: HTMLElement | null = n as HTMLElement;
      while (cur && cur !== content) {
        y += cur.offsetTop;
        cur = cur.offsetParent as HTMLElement | null;
      }
      return { y, height: parseFloat(getComputedStyle(n).height) };
    });
    const y = box.y;
    if (Math.abs(box.height - block.height) > HEIGHT_TOLERANCE) {
      problems.push(`${block.name} (${block.id}): высота ${box.height.toFixed(1)} ≠ ${block.height}`);
    }
    if (Math.abs(y - block.y) > Y_TOLERANCE) {
      problems.push(`${block.name} (${block.id}): y ${y.toFixed(1)} ≠ ${block.y}`);
    }
  }

  const bar = page.locator(`[data-node-id="${FIGMA_BOTTOM_BAR.id}"]`).first();
  if ((await bar.count()) === 0) {
    problems.push(`${FIGMA_BOTTOM_BAR.name}: нет элемента с data-node-id`);
  } else {
    const b = await bar.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return { bottom: r.bottom, height: r.height, position: getComputedStyle(n).position };
    });
    if (Math.abs(b.height - FIGMA_BOTTOM_BAR.height) > HEIGHT_TOLERANCE) {
      problems.push(`BottomBar: высота ${b.height} ≠ ${FIGMA_BOTTOM_BAR.height}`);
    }
    if (b.position !== 'fixed' && b.position !== 'sticky') problems.push(`BottomBar: position ${b.position}, ожидается fixed`);
    if (Math.abs(b.bottom - page.viewportSize()!.height) > 1) problems.push(`BottomBar не прижата к низу (bottom=${b.bottom})`);
  }

  expect(problems, problems.join('\n')).toEqual([]);
});

test('все ассеты локальные и загружены', async ({ page }) => {
  await open(page);
  // Пролистываем экран, чтобы сработали lazy-изображения
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');

  const report = await page.evaluate(() => {
    const imgs = [...document.images].map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 }));
    const html = document.documentElement.outerHTML;
    const cssUrls = [...document.querySelectorAll<HTMLElement>('*')]
      .map((n) => getComputedStyle(n).backgroundImage)
      .filter((v) => v.includes('url('));
    return { imgs, cssUrls, figmaTemp: /figma\.com\/api\/mcp\/asset|localhost:3845/.test(html + cssUrls.join(' ')) };
  });

  expect(report.figmaTemp, 'в DOM остались временные URL ассетов Figma').toBe(false);
  const broken = report.imgs.filter((i) => !i.ok).map((i) => i.src);
  expect(broken, `не загрузились: ${broken.join(', ')}`).toEqual([]);
  for (const u of report.cssUrls) expect(u).not.toMatch(/https?:\/\/(?!127\.0\.0\.1)/);
});

for (const width of [320, 375, 393, 430]) {
  test(`нет горизонтального скролла на ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 852 });
    await open(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('скриншоты блоков для сверки с docs/figma', async ({ page }) => {
  mkdirSync(COMPARE_DIR, { recursive: true });
  await open(page);
  await page.screenshot({ path: `${COMPARE_DIR}/full-page.png`, fullPage: true, animations: 'disabled' });
  const bar = page.locator(`[data-node-id="${FIGMA_BOTTOM_BAR.id}"]`).first();
  if ((await bar.count()) > 0) {
    await bar.screenshot({ path: `${COMPARE_DIR}/${FIGMA_BOTTOM_BAR.id.replace(':', '-')}.png`, animations: 'disabled' });
  }
  // Фиксированная панель перекрывала бы низ секций на их скриншотах
  await page.addStyleTag({ content: `[data-node-id="${FIGMA_BOTTOM_BAR.id}"] { visibility: hidden !important; }` });
  for (const block of FIGMA_BLOCKS) {
    const el = page.locator(`[data-node-id="${block.id}"]`).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: `${COMPARE_DIR}/${block.id.replace(':', '-')}.png`, animations: 'disabled' });
  }
});
