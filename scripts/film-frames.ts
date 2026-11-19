// Stills of one film at chosen times and widths, for reviewing a film while building it.
// Usage: bun scripts/film-frames.ts <route> <times in ms, comma separated> [widths, default 1440,390,320] [output folder]
// Build with drafts first: URUK_DRAFTS=1 bun run build
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { waitForNumerics, withSiteBrowser } from './site-browser';

const PHONE_WIDTH = 600;

function numbers(text: string): number[] {
  const values: number[] = [];

  for (const part of text.split(',')) {
    const value = Number(part);

    if (Number.isFinite(value)) values.push(value);
  }

  return values;
}

async function seek(page: Page, time: number): Promise<string> {
  return page.evaluate(async (nextTime) => {
    const range = document.querySelector<HTMLInputElement>('[data-film-range]');
    const canvas = document.querySelector<HTMLCanvasElement>('[data-film-canvas]');

    if (!range || !canvas) throw new Error('This page has no narrated film.');

    range.value = String(nextTime);
    range.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    return canvas.toDataURL();
  }, time);
}

/** After calculations finish, wait until the same time draws the same picture twice. */
async function settle(page: Page, time: number): Promise<void> {
  let previous = '';

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const picture = await seek(page, time);

    if (picture === previous) return;

    previous = picture;
    await page.waitForTimeout(500);
  }

  throw new Error('The film never settled.');
}

const [route, timesText, widthsText = '1440,390,320', outputText] = process.argv.slice(2);

if (!route || !timesText) {
  console.error('Usage: bun scripts/film-frames.ts <route> <times in ms, comma separated> [widths] [output folder]');
  process.exit(1);
}

const times = numbers(timesText);
const output = outputText ?? join('/tmp/uruk-work/frames', route.replaceAll('/', '-').replace(/^-+|-+$/g, ''));
await mkdir(output, { recursive: true });
await withSiteBrowser(async (browser, origin) => {
  for (const width of numbers(widthsText)) {
    const phone = width < PHONE_WIDTH;
    const context = await browser.newContext({ viewport: { width, height: phone ? 900 : 1000 }, deviceScaleFactor: phone ? 2 : 1 });

    try {
      const page = await context.newPage();
      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await waitForNumerics(page);
      await settle(page, times[0] ?? 0);

      for (const time of times) {
        await seek(page, time);
        await page.locator('.plate').screenshot({ path: join(output, `${width}-${String(time).padStart(6, '0')}.png`) });
      }
    } finally {
      await context.close();
    }
  }
});
console.log(`Saved ${times.length} time(s) at each width to ${output}`);
