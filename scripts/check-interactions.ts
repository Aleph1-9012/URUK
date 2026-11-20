import assert from 'node:assert/strict';
import type { Browser, Page } from 'playwright-core';
import { filmRoutes, waitForNumerics, withSiteBrowser } from './site-browser';

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
  await waitForNumerics(page);
  const loader = page.locator('.film-host [data-plate-loader]');
  assert.equal(await loader.count(), 1);
  assert.equal(await loader.isVisible(), false);
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
  await waitForNumerics(page);
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

async function checkDig(page: Page, origin: string): Promise<void> {
  await page.goto(origin);
  const dig = page.locator('uruk-dig');
  const ring = dig.getByRole('button', { name: 'Dig one layer' });
  const openAll = dig.getByRole('button', { name: 'Open every layer' });
  const wholeResult = dig.getByRole('link', { name: 'Read the whole result' });
  await ring.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await waitFrames(page);

  function measure() {
    return dig.evaluate((section) => {
      const bounds = section.getBoundingClientRect();

      return {
        height: bounds.height,
        layers: Array.from(section.querySelectorAll('[data-dig-layer]'), (layer) => {
          const row = layer.getBoundingClientRect();

          return { top: row.top - bounds.top, height: row.height };
        }),
        open: Array.from(section.querySelectorAll('.dig__answer')).filter((answer) => getComputedStyle(answer).visibility === 'visible').length,
      };
    });
  }

  const initial = await measure();
  assert.equal(initial.open, 1);
  assert.equal(await wholeResult.count(), 0);

  for (const action of [ring, openAll]) {
    await action.click();
    await waitFrames(page);
    const current = await measure();
    assert.equal(current.open, action === ring ? 2 : initial.layers.length);
    assert.ok(Math.abs(current.height - initial.height) <= 0.5, 'Opening a layer must preserve the Dig section height.');
    assert.deepEqual(current.layers, initial.layers, 'Dig layer positions must stay fixed.');
  }

  assert.equal(await ring.count(), 0);
  assert.equal(await wholeResult.count(), 1);
}

async function checkInitialLayout(browser: Browser, origin: string): Promise<void> {
  type Bounds = { selector: string; left: number; top: number; width: number; height: number };
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });

  function dimensions(page: Page, selectors: string[]): Promise<Bounds[]> {
    return page.evaluate((targets) => targets.map((selector) => {
      const element = document.querySelector(selector);

      if (!element) throw new Error(`Missing layout target: ${selector}`);

      const { left, top, width, height } = element.getBoundingClientRect();

      return { selector, left, top, width, height };
    }), selectors);
  }

  function unchanged(before: Bounds[], after: Bounds[], phase: string): void {
    for (const [index, bounds] of after.entries()) {
      const initial = before[index];
      assert.ok(initial, `Missing initial bounds for ${bounds.selector}`);

      for (const key of ['left', 'top', 'width', 'height'] as const) {
        assert.ok(Math.abs(bounds[key] - initial[key]) <= 0.5, `${phase}: ${bounds.selector} ${key} changed from ${initial[key]} to ${bounds[key]}`);
      }
    }
  }

  try {
    const about = await context.newPage();
    const fonts = Promise.withResolvers<void>();

    try {
      await about.route('**/fonts/*.woff2', async (route) => {
        await fonts.promise;
        await route.continue();
      });
      await about.goto(`${origin}/about/`, { waitUntil: 'commit' });
      await about.locator('.about-page h1').waitFor({ state: 'visible' });
      await about.waitForFunction(() => performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint'));
      await waitFrames(about);
      const loadedFonts = await about.evaluate(() => [
        { family: 'Alegreya', style: 'normal' },
        { family: 'Alegreya', style: 'italic' },
        { family: 'Special Elite', style: 'normal' },
      ].map(({ family, style }) => ({
        family,
        style,
        loaded: Array.from(document.fonts).some((face) => face.family.replaceAll('"', '') === family && face.style === style && face.status === 'loaded'),
      })));

      for (const font of loadedFonts) assert.ok(font.loaded, `${font.style} ${font.family} must be loaded before external fonts arrive.`);

      const selectors = ['body', '.site-header', '.about-page h1'];
      const initial = await dimensions(about, selectors);
      fonts.resolve();
      await about.evaluate(async () => { await document.fonts.ready; });
      await waitFrames(about);
      unchanged(initial, await dimensions(about, selectors), 'Font loading');
    } finally {
      fonts.resolve();
      await about.unrouteAll({ behavior: 'wait' });
      await about.close();
    }

    const result = await context.newPage();
    const scripts = Promise.withResolvers<void>();
    let delayedScripts = 0;

    try {
      await result.route('**/_astro/*.js', async (route) => {
        delayedScripts += 1;
        await scripts.promise;
        await route.continue();
      });
      await result.route('**/fonts/*.woff2', async (route) => {
        await scripts.promise;
        await route.continue();
      });
      await result.goto(`${origin}/results/003/`, { waitUntil: 'commit' });
      await result.locator('.film-host').waitFor({ state: 'visible' });
      await result.waitForFunction(() => document.fonts.check('17px "Garamond Math"', 'x∑𝑥'));
      await result.evaluate(async () => { await document.fonts.ready; });
      await waitFrames(result);
      assert.ok(delayedScripts > 0, 'The initial article frame must precede its delayed browser scripts.');
      assert.equal(await result.locator('.film-host[data-ready]').count(), 0);
      const controlsHeight = await result.locator('.film-controls').evaluate((element) => element.getBoundingClientRect().height);
      assert.ok(controlsHeight > 0, 'Film controls must reserve space before the film starts.');
      const sources = result.locator('uruk-sources');
      assert.equal(await sources.getAttribute('data-open'), null);
      assert.equal(await sources.locator('.sources-table').isVisible(), false);
      const selectors = ['.film-host', '.result-introduction'];
      const initial = await dimensions(result, selectors);
      scripts.resolve();
      await result.locator('.film-host[data-ready]').waitFor({ state: 'visible' });
      await result.evaluate(async () => { await document.fonts.ready; });
      await waitFrames(result);
      unchanged(initial, await dimensions(result, selectors), 'Film initialization');
      assert.equal(await sources.getAttribute('data-open'), null);
      assert.equal(await sources.locator('.sources-table').isVisible(), false);
    } finally {
      scripts.resolve();
      await result.unrouteAll({ behavior: 'wait' });
      await result.close();
    }
  } finally {
    await context.close();
  }
}

async function checkFilmFirstPaint(browser: Browser, origin: string): Promise<void> {
  const modes = [
    { javaScriptEnabled: true, reducedMotion: 'no-preference' },
    { javaScriptEnabled: true, reducedMotion: 'reduce' },
    { javaScriptEnabled: false, reducedMotion: 'no-preference' },
  ] as const;

  for (const mode of modes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...mode });
    const scripts = Promise.withResolvers<void>();
    let page: Page | undefined;

    try {
      page = await context.newPage();
      await page.goto(`${origin}/results/`);
      await page.route('**/_astro/*.js', async (route) => {
        await scripts.promise;
        await route.continue();
      });
      await page.locator('.menu-index__row[data-index-family="158"]').click({ noWaitAfter: true });
      await page.waitForURL('**/results/158/', { waitUntil: 'commit' });
      const viewport = page.locator('[data-film-viewport]');
      await viewport.waitFor({ state: 'attached' });
      await page.waitForFunction(() => performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint'));
      await page.evaluate(async () => { await document.fonts.ready; });

      if (mode.javaScriptEnabled) await waitFrames(page);

      const loader = viewport.locator('[data-plate-loader]');
      assert.equal(await loader.isVisible(), mode.javaScriptEnabled);

      if (mode.reducedMotion === 'reduce') {
        const sign = loader.locator('.plate-loader__one--1');
        const style = await sign.evaluate((element) => {
          const { animationName, opacity } = getComputedStyle(element);

          return { animationName, opacity };
        });
        assert.deepEqual(style, { animationName: 'none', opacity: '1' });
      }

      const before = await viewport.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const picture = element.querySelector('.film-picture');

        if (!picture) throw new Error('The film stage must contain its picture.');

        return { width: bounds.width, height: bounds.height, opacity: getComputedStyle(picture).opacity };
      });
      assert.ok(before.width > 0 && before.height > 0, 'The waiting film must reserve its final viewport dimensions.');

      assert.equal(before.opacity, '0', 'Navigation must not paint an illustration before the live opening frame is ready.');

      if (!mode.javaScriptEnabled) {
        const transcript = page.locator('.film-transcript');
        await transcript.locator('summary').click();
        assert.notEqual(await transcript.getAttribute('open'), null, 'The transcript must remain available without browser scripts.');
        assert.equal(await transcript.locator('li').first().isVisible(), true);
        assert.ok((await transcript.locator('li').first().innerText()).trim().length > 0);
      }

      if (mode.javaScriptEnabled) {
        const ready = page.locator('.film-host').evaluate((host) => new Promise<{ time: number; width: number; height: number; opacity: string }>((resolve, reject) => {
          const observer = new MutationObserver(() => {
            if (!host.hasAttribute('data-ready')) return;

            observer.disconnect();
            clearTimeout(timeout);
            const stage = host.querySelector('[data-film-viewport]');
            const picture = stage?.querySelector('.film-picture');

            if (!stage || !picture) {
              reject(new Error('A ready film must retain its viewport and picture.'));

              return;
            }

            const bounds = stage.getBoundingClientRect();
            resolve({ time: Number(host.querySelector<HTMLInputElement>('[data-film-range]')?.value), width: bounds.width, height: bounds.height, opacity: getComputedStyle(picture).opacity });
          });
          const timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error('The film did not reveal a ready opening frame.'));
          }, 10000);
          observer.observe(host, { attributes: true, attributeFilter: ['data-ready'] });
        }));
        scripts.resolve();
        const first = await ready;
        assert.equal(first.time, 0, 'The live film must become visible at its beginning.');
        assert.equal(first.opacity, '1');
        assert.equal(await loader.isVisible(), false);
        assert.ok(Math.abs(first.width - before.width) <= 0.5 && Math.abs(first.height - before.height) <= 0.5, 'Revealing the opening frame must preserve the film viewport dimensions.');
      }
    } finally {
      scripts.resolve();

      try {
        await page?.unrouteAll({ behavior: 'wait' });
      } finally {
        await context.close();
      }
    }
  }
}

async function checkRollOpening(browser: Browser, origin: string): Promise<void> {
  type OpeningFrame = { top: number; height: number; cardTop: number; visibleTop: number; lowerEdge: number; scrollTop: number; pageY: number; viewportHeight: number };
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', isMobile: true, hasTouch: true });
  const scripts = Promise.withResolvers<void>();
  let page: Page | undefined;

  function recordOpening(target: Page): Promise<OpeningFrame[]> {
    return target.evaluate(() => new Promise<OpeningFrame[]>((resolve, reject) => {
      const roll = document.querySelector<HTMLElement>('uruk-roll');
      const paper = roll?.querySelector<HTMLElement>('.roll-paper');
      const viewport = roll?.querySelector<HTMLElement>('.roll-window');
      const card = roll?.querySelector<HTMLElement>('.roll-card');

      if (!roll || !paper || !viewport || !card) {
        reject(new Error('The phone results roll must contain paper, a window and cards.'));

        return;
      }

      const frames: OpeningFrame[] = [];
      const start = performance.now();
      let began = false;

      function frame(now: number): void {
        if (!roll || !paper || !viewport || !card) return;

        const state = roll.dataset.arrival;

        if (state === 'opening') began = true;

        if (began) {
          const bounds = paper.getBoundingClientRect();
          const values = getComputedStyle(paper).clipPath.match(/^inset\((.+)\)$/)?.[1]?.trim().split(/\s+/);
          const top = values?.[0] ?? '0';
          const bottom = values?.[2] ?? top;
          const inset = (value: string) => Math.max(0, parseFloat(value) * (value.endsWith('%') ? bounds.height / 100 : 1));
          frames.push({ top: bounds.top, height: bounds.height, cardTop: card.getBoundingClientRect().top, visibleTop: bounds.top + inset(top), lowerEdge: bounds.bottom - inset(bottom), scrollTop: viewport.scrollTop, pageY: scrollY, viewportHeight: innerHeight });

          if (state === 'open') {
            resolve(frames);

            return;
          }
        }

        if (now - start > 5000) {
          reject(new Error('The phone roll never completed a visible opening.'));

          return;
        }

        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }));
  }

  function assertOpening(frames: OpeningFrame[]): void {
    const first = frames[0];
    const last = frames.at(-1);
    assert.ok(first && last, 'The opening must produce measured animation frames.');
    assert.ok(frames.some((frame) => frame.lowerEdge > frame.visibleTop + 1 && frame.lowerEdge < frame.visibleTop + frame.height - 1), 'The paper must visibly open through a partial state.');
    let previous = first;

    for (const frame of frames) {
      assert.ok(Math.abs(frame.visibleTop - first.visibleTop) <= 0.5, 'The visible top edge must stay anchored under the roller.');
      assert.equal(frame.pageY, 0);
      assert.equal(frame.scrollTop, 0);

      if (frame.viewportHeight === previous.viewportHeight) {
        assert.ok(Math.abs(frame.height - previous.height) <= 0.5, 'The paper must retain its measured height at a constant viewport size.');
        assert.ok(frame.top >= previous.top - 0.5, 'The paper must feed downward rather than slide upward.');
        assert.ok(frame.cardTop >= previous.cardTop - 0.5, 'The cards must travel downward with the paper.');
        assert.ok(frame.lowerEdge >= previous.lowerEdge - 0.5, 'The revealed lower edge must grow downward without retracting.');
      }

      previous = frame;
    }

    assert.ok(last.top > first.top + 1 && last.cardTop > first.cardTop + 1, 'Opening must move the paper and cards downward, rather than wipe over stationary content.');
    assert.ok(Math.abs(last.visibleTop - last.top) <= 0.5 && Math.abs(last.lowerEdge - last.top - last.height) <= 0.5, 'The opening must finish with the entire paper revealed.');
  }

  try {
    page = await context.newPage();
    await page.route('**/_astro/*.js', async (route) => {
      await scripts.promise;
      await route.continue();
    });
    await page.goto(`${origin}/results/`, { waitUntil: 'commit' });
    await page.locator('.roll-paper').waitFor({ state: 'attached' });
    await page.waitForFunction(() => performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint'));
    await waitFrames(page);
    const pending = await page.locator('.roll-paper').evaluate((paper) => ({
      height: paper.getBoundingClientRect().height,
      viewportHeight: innerHeight,
      clip: getComputedStyle(paper).clipPath,
    }));
    assert.ok(pending.height > 0 && pending.height < pending.viewportHeight * 2, 'The waiting paper must fit a phone-sized sheet before browser scripts arrive.');
    const insets = pending.clip.match(/^inset\((.+)\)$/)?.[1]?.trim().split(/\s+/);
    assert.equal(insets?.[0], '100%', 'The first painted paper must remain rolled up above its visible top edge.');
    const opening = recordOpening(page);
    scripts.resolve();
    assertOpening(await opening);
    await page.unrouteAll({ behavior: 'wait' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${origin}/results/`);
    await page.waitForFunction(() => document.querySelector<HTMLElement>('uruk-roll')?.dataset.arrival === 'desktop');
    await page.evaluate(async () => { await document.fonts.ready; });
    const previewOpening = recordOpening(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => {
      const paper = document.querySelector('.roll-paper');
      const top = paper && getComputedStyle(paper).clipPath.match(/^inset\(([^\s)]+)/)?.[1];
      const percent = top ? parseFloat(top) : 0;

      return percent > 10 && percent < 90;
    });
    await page.setViewportSize({ width: 390, height: 864 });
    await waitFrames(page);
    const afterResize = await page.locator('.roll-paper').evaluate((paper) => {
      const top = getComputedStyle(paper).clipPath.match(/^inset\(([^\s)]+)/)?.[1];

      return top ? parseFloat(top) : 0;
    });
    assert.ok(afterResize > 0 && afterResize < 100, 'A small height change must preserve the ongoing opening rather than finish it.');
    const previewFrames = await previewOpening;
    assertOpening(previewFrames);
    assert.ok(previewFrames.some((frame) => frame.viewportHeight === 844) && previewFrames.some((frame) => frame.viewportHeight === 864), 'The opening must continue across the preview height change.');
    await page.setViewportSize({ width: 1280, height: 900 });
    await waitFrames(page);
    await page.setViewportSize({ width: 390, height: 864 });
    const replay = await page.locator('.roll-paper').evaluate(async (paper) => {
      const frames: { clip: string; translateY: number }[] = [];

      for (let count = 0; count < 8; count += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const style = getComputedStyle(paper);
        frames.push({ clip: style.clipPath, translateY: new DOMMatrixReadOnly(style.transform).m42 });
      }

      return frames;
    });
    assert.ok(replay.every((frame) => frame.clip === 'none' && Math.abs(frame.translateY) <= 0.5), 'Returning to phone preview after completion must leave the paper open without replaying.');
  } finally {
    scripts.resolve();

    try {
      await page?.unrouteAll({ behavior: 'wait' });
    } finally {
      await context.close();
    }
  }
}

async function checkNumerics(browser: Browser, origin: string): Promise<void> {
  for (const failure of [false, true]) {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const release = Promise.withResolvers<void>();
    let requests = 0;

    try {
      await context.route('**/_astro/worker*.js', async (route) => {
        requests += 1;
        await release.promise;

        if (failure) {
          await route.fulfill({ contentType: 'text/javascript', body: 'throw new Error("Calculation failure probe");' });
        } else {
          await route.continue();
        }
      });
      const page = await context.newPage();
      await page.goto(`${origin}/results/003/`, { waitUntil: 'domcontentloaded' });
      const film = page.locator('.film-host');
      await page.locator('.film-host[data-numerics-pending]').waitFor();
      const loader = film.locator('[data-plate-loader]');
      const canvas = film.locator('[data-film-canvas]');
      assert.equal(await loader.isVisible(), true);
      assert.equal(await canvas.isVisible(), false);
      assert.equal(await film.locator('.film-controls').isVisible(), false);
      let settled = false;

      const outcome = waitForNumerics(page).then(
        () => 'ready' as const,
        (cause) => cause instanceof Error ? cause : new Error(String(cause)),
      ).then((result) => {
        settled = true;

        return result;
      });

      await waitFrames(page);
      assert.equal(settled, false, 'Capture must keep waiting while the worker is delayed.');
      release.resolve();
      const result = await outcome;
      assert.equal(requests, 1, 'The real numerical worker must pass through the delay.');
      assert.equal(await film.getAttribute('data-numerics-pending'), null);
      assert.equal(await loader.isVisible(), false);

      if (failure) {
        assert.ok(result instanceof Error);
        assert.match(result.message, /Calculation failure probe/);
        assert.equal(await film.getAttribute('data-numerics-ready'), null);
        assert.equal(await canvas.isVisible(), false);
        assert.equal(await film.getByRole('status').filter({ hasText: 'The film could not load.' }).isVisible(), true);
      } else {
        assert.equal(result, 'ready');
        assert.equal(await film.getAttribute('data-numerics-ready'), '');
        assert.equal(await canvas.isVisible(), true);
        assert.equal((await filmState(page)).time, 0);
      }
    } finally {
      release.resolve();
      await context.close();
    }
  }
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

await withSiteBrowser(async (browser, origin) => {
  const routes = await filmRoutes();

  assert.ok(routes.length > 0, 'Build the site before running interaction checks.');
  await checkInitialLayout(browser, origin);
  await checkFilmFirstPaint(browser, origin);
  await checkRollOpening(browser, origin);
  await checkNumerics(browser, origin);
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

      await checkDig(page, origin);
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

  console.log(`Checked initial font/film layout stability, each motion mode's first visible frame and the script-free transcript, the phone roll's downward opening, delayed and failed film calculations, all ${routes.length} narrated films in ${filmCount} sessions, playback pauses, standard-map worker/reconnect behavior, stable Dig rows, search/filter, and back-to-top navigation.`);
});
