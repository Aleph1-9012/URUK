import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { preview } from 'astro';
import { chromium, type Browser, type Page } from 'playwright-core';

async function filmState(page: Page) {
  return page.evaluate(() => {
    const range = document.querySelector<HTMLInputElement>('[data-film-range]');
    const cues = Array.from(document.querySelectorAll('[data-cue]'));

    return {
      time: Number(range?.value),
      duration: Number(range?.max),
      cue: cues.findIndex((cue) => cue.classList.contains('is-active')),
      cueCount: cues.length,
      previousDisabled: document.querySelector<HTMLButtonElement>('[data-film-previous]')?.disabled,
      nextDisabled: document.querySelector<HTMLButtonElement>('[data-film-next]')?.disabled,
      play: document.querySelector('[data-play-label]')?.textContent,
      announcement: document.querySelector('[data-film-status]')?.textContent,
    };
  });
}

async function checkFilm(page: Page): Promise<void> {
  const range = page.locator('[data-film-range]');
  await page.waitForFunction(() => document.querySelector('[data-ready] [data-film-range]') !== null);
  await range.scrollIntoViewIfNeeded();
  assert.equal((await filmState(page)).cue, 0);

  await page.locator('[data-film-next]').click();
  const stepped = await filmState(page);
  assert.equal(stepped.cue, 1);
  assert.ok(stepped.announcement);
  await page.locator('[data-film-previous]').click();
  assert.equal((await filmState(page)).cue, 0);

  await range.press('End');
  const ended = await filmState(page);
  assert.equal(ended.time, ended.duration);
  assert.equal(ended.cue, ended.cueCount - 1);
  assert.equal(ended.nextDisabled, true);
  assert.equal(ended.play, 'Replay');

  await range.press('Home');
  assert.equal((await filmState(page)).time, 0);
  await range.press('ArrowRight');
  assert.equal((await filmState(page)).cue, 1);
  await range.press('PageDown');
  assert.equal((await filmState(page)).cue, 0);

  const targetTime = await range.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) throw new Error('Film range must be an input.');

    const step = Number(element.step);

    if (!(step > 0)) throw new Error('Film controls declare a positive numeric scrub step.');

    const target = Math.round(Number(element.max) / 2 / step) * step;
    element.value = String(target);
    element.dispatchEvent(new Event('input', { bubbles: true }));

    return target;
  });
  const scrubbed = await filmState(page);
  assert.equal(scrubbed.time, targetTime);

  await range.evaluate((element) => {
    const film = element.closest('[data-ready]');
    const parent = film?.parentNode;

    if (!film || !parent) throw new Error('Film must be mounted.');

    const next = film.nextSibling;
    film.remove();

    if (film.hasAttribute('data-ready')) throw new Error('Detached film retained readiness.');

    parent.insertBefore(film, next);
  });
  assert.equal((await filmState(page)).time, 0);
  await page.locator('[data-film-next]').click();
  assert.equal((await filmState(page)).cue, 1);
}

async function checkMenu(page: Page, origin: string): Promise<void> {
  await page.goto(`${origin}/results/`);
  const search = page.locator('[data-search]');
  await search.fill('colour');
  await page.waitForFunction(() => location.search.includes('q=colour'));

  const counts = await page.evaluate(() => ({
    cards: Array.from(document.querySelectorAll<HTMLElement>('.roll-card:not([hidden])'), (node) => node.dataset.family),
    rows: Array.from(document.querySelectorAll<HTMLElement>('[data-index-family]:not([hidden])'), (node) => node.dataset.indexFamily),
  }));

  assert.ok(counts.cards.length > 0);
  assert.deepEqual(counts.cards, counts.rows);
  await search.fill('no-such-uruk-paper');
  assert.equal(await page.locator('.roll-card:not([hidden])').count(), 0);
  assert.equal(await page.locator('[data-no-results]').isVisible(), true);
  await page.locator('[data-clear]').click();
  assert.ok(await page.locator('.roll-card:not([hidden])').count() > 0);
  await page.locator('[data-filter="under-review"]').click();
  assert.equal(await page.locator('.roll-card:not([hidden]):not([data-status="under-review"])').count(), 0);

  if ((page.viewportSize()?.width ?? 0) < 768) {
    await page.locator('[data-filter=""]').click();
    const roll = page.getByRole('group', { name: 'Results roll', exact: true });
    await roll.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: 'instant' }));
    const back = page.locator('uruk-back-to-top[data-floating] a[aria-label="Back to top"]');
    await back.waitFor({ state: 'visible' });
    await back.click();
    assert.equal(await roll.evaluate((element) => element.scrollTop), 0);
  }
}

async function waitFrames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => {
    let count = 0;

    function frame(): void {
      count += 1;

      if (count === 4) resolve();
      else requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }));
}

async function checkPlayback(page: Page, origin: string): Promise<void> {
  await page.goto(`${origin}/results/165/`);
  await page.waitForFunction(() => document.querySelector('[data-ready] [data-film-range]') !== null);
  const viewport = page.locator('[data-film-viewport]');
  const play = page.locator('[data-play]');
  await viewport.scrollIntoViewIfNeeded();

  if ((await filmState(page)).play === 'Pause') await play.click();

  const start = (await filmState(page)).time;
  await play.click();
  await page.waitForFunction((time) => Number(document.querySelector<HTMLInputElement>('[data-film-range]')?.value) > time + 200, start);
  await play.click();
  const paused = (await filmState(page)).time;
  await waitFrames(page);
  assert.equal((await filmState(page)).time, paused);

  await play.click();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await waitFrames(page);
  const offscreen = (await filmState(page)).time;
  await waitFrames(page);
  assert.equal((await filmState(page)).time, offscreen);
  await viewport.scrollIntoViewIfNeeded();
  await page.waitForFunction((time) => Number(document.querySelector<HTMLInputElement>('[data-film-range]')?.value) > time + 200, offscreen);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await waitFrames(page);
  const reduced = (await filmState(page)).time;
  await waitFrames(page);
  assert.equal((await filmState(page)).time, reduced);
}

async function checkStandardMap(page: Page, origin: string): Promise<void> {
  await page.goto(`${origin}/results/146/`);
  await page.locator('[data-plate-loader]').waitFor({ state: 'detached' });
  const canvas = page.locator('[data-map-canvas]');
  const track = page.getByRole('slider');
  const initial = await canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('The orbit picture must be a canvas.');

    return element.toDataURL();
  });

  await track.press('End');
  assert.equal(await track.getAttribute('aria-valuenow'), '1');
  await page.waitForFunction((original) => document.querySelector<HTMLCanvasElement>('[data-map-canvas]')?.toDataURL() !== original, initial);
  await page.locator('[data-reset]').click();
  assert.equal(await track.getAttribute('aria-valuenow'), '0.2');
  await page.waitForFunction((original) => document.querySelector<HTMLCanvasElement>('[data-map-canvas]')?.toDataURL() === original, initial);

  await track.press('End');
  await page.waitForFunction((original) => document.querySelector<HTMLCanvasElement>('[data-map-canvas]')?.toDataURL() !== original, initial);
  const beforeReconnect = await canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('The orbit picture must be a canvas.');

    return element.toDataURL();
  });

  await canvas.evaluate((element) => {
    const map = element.closest('uruk-standard-map');
    const parent = map?.parentNode;

    if (!map || !parent) throw new Error('The standard map must be mounted.');

    const next = map.nextSibling;
    map.remove();
    parent.insertBefore(map, next);
  });
  assert.equal(await track.getAttribute('aria-valuenow'), '1');
  await track.press('Home');
  assert.equal(await track.getAttribute('aria-valuenow'), '0');
  await page.waitForFunction((original) => document.querySelector<HTMLCanvasElement>('[data-map-canvas]')?.toDataURL() !== original, beforeReconnect);
}

const server = await preview({ server: { host: '127.0.0.1', port: 4322 }, logLevel: 'error' });
let browser: Browser | undefined;

try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const origin = `http://127.0.0.1:${server.port}`;
  const routes: string[] = [];

  for (const entry of await readdir('dist/results', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const html = await readFile(`dist/results/${entry.name}/index.html`, 'utf8');

    if (html.includes('data-film-range')) routes.push(`/results/${entry.name}/`);
  }

  assert.ok(routes.length > 0, 'Build the site before running interaction checks.');
  let filmCount = 0;

  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    try {
      for (const route of routes) {
        const response = await page.goto(`${origin}${route}`);
        assert.ok(response?.ok(), `Could not load ${route}`);
        assert.equal(await page.locator('[data-film-range]').count(), 1, `Missing film on ${route}`);

        await checkFilm(page);
        filmCount += 1;
      }

      await checkMenu(page, origin);
      assert.deepEqual(errors, [], `Browser errors at width ${width}`);
    } finally {
      await context.close();
    }
  }

  assert.equal(filmCount, routes.length * 2);
  const playback = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });

  try {
    const page = await playback.newPage();
    await checkPlayback(page, origin);
    await checkStandardMap(page, origin);
  } finally {
    await playback.close();
  }

  console.log(`Checked all ${routes.length} narrated films in ${filmCount} sessions, playback pauses, standard-map worker/reconnect behavior, and search/filter/back-to-top interactions.`);
} finally {
  try {
    await browser?.close();
  } finally {
    await server.stop();
  }
}
