import assert from 'node:assert/strict';
import type { Browser, Page } from 'playwright-core';

const destination = '/how-we-check/';
const cases = [
  { width: 1440, height: 900, dpr: 2, print: 'print-2', type: 76 },
  { width: 390, height: 844, dpr: 3, print: 'print-3', type: 72, noIdleCallback: true },
  { width: 320, height: 568, dpr: 2, print: 'print-2', type: 48, saveData: true },
  { width: 390, height: 844, dpr: 2.625, print: 'heads', type: 64 },
];

async function arrivalScripts(page: Page, kind: string) {
  return page.evaluate(kind => {
    const script = document.querySelector<HTMLScriptElement>('#cone-config');
    if (!script?.dataset.coneAssets) throw new Error('Missing cone config');
    const { head }: Record<string, string> = JSON.parse(script.dataset.coneAssets);
    return performance.getEntriesByType('resource').flatMap(entry => {
      if (!(entry instanceof PerformanceResourceTiming) || entry.initiatorType !== kind) return [];
      const { pathname } = new URL(entry.name);
      const asset = pathname.split('/').at(-1);
      if (!asset || (pathname !== head && (!/^\/cone-data\/[0-9a-f]{20}\//.test(pathname) || asset === 'entry.js'))) return [];
      return [{ pathname, start: entry.startTime }];
    });
  }, kind);
}

async function waitForWarming(page: Page) {
  await page.waitForFunction(() => performance.getEntriesByType('resource').filter(entry =>
    entry instanceof PerformanceResourceTiming && entry.initiatorType === 'fetch'
    && /\/(?:print-\d+|heads|type-\d+|rebuild|head\.[\w-]+)\.js$/.test(entry.name)).length === 4);
}

export async function checkConeArrival(browser: Browser, origin: string) {
  for (const { width, height, dpr, print, type, noIdleCallback, saveData } of cases) {
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: dpr, isMobile: width < 768, hasTouch: width < 768,
    });

    try {
      await context.addInitScript(({ noIdleCallback, saveData }) => {
        if (noIdleCallback) Object.defineProperty(window, 'requestIdleCallback', { value: undefined });
        if (saveData) Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (this === sessionStorage && key === 'uruk:cone-destination') {
            throw new DOMException('Exercise the marker arrival', 'QuotaExceededError');
          }
          return setItem.call(this, key, value);
        };
        new MutationObserver(() => {
          const stage = document.documentElement.dataset.coneStage;
          if (stage === 'arriving' || stage === 'opening') performance.mark(`check:cone-${stage}`);
        }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-cone-stage'] });
      }, { noIdleCallback, saveData });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + '/about/');
      await page.waitForFunction(() => {
        const staged = sessionStorage.getItem('uruk:cone-staged');
        return staged && !staged.startsWith('building:');
      });
      const data = await page.locator('#cone-config').getAttribute('data-cone-assets');
      assert.ok(data);
      const manifest: Record<string, string> = JSON.parse(data);
      const expected = [print, `type-${type}`, 'rebuild'].map(name => `/cone-data/${manifest[name]}/${name}.js`);
      assert.ok(manifest.head);
      expected.push(manifest.head);
      expected.sort();

      if (saveData) {
        // Check past the idle callback timeout, not merely before warming could start.
        await page.waitForTimeout(1700);
        assert.deepEqual(await arrivalScripts(page, 'fetch'), []);
      } else {
        await waitForWarming(page);
        const warmed = await arrivalScripts(page, 'fetch');
        assert.deepEqual(warmed.map(e => e.pathname).sort(), expected);
        const load = await page.evaluate(() => performance.getEntriesByType('navigation')
          .find(entry => entry instanceof PerformanceNavigationTiming)?.loadEventEnd);
        assert.ok(load && warmed.every(e => e.start > load));
      }

      const preloads: string[] = [];
      page.on('console', message => {
        const value = message.text();
        if (value.startsWith('check:cone-preload ')) preloads.push(value.slice('check:cone-preload '.length));
      });
      await page.evaluate(() => {
        const observer = new MutationObserver(records => {
          for (const record of records) for (const node of record.addedNodes) {
            if (node instanceof HTMLLinkElement && node.rel === 'preload' && node.as === 'script') {
              console.debug('check:cone-preload ' + new URL(node.href).pathname);
            }
          }
        });
        observer.observe(document.head, { childList: true });
      });
      const marker = page.waitForRequest(request => request.isNavigationRequest() && new URL(request.url()).searchParams.has('__uruk_cone'));
      const link = page.locator(`header a[href="${destination}"]`);
      if (width < 768) await link.tap(); else await link.click();
      await marker;
      await page.waitForURL(origin + destination);
      await page.waitForFunction(() => performance.getEntriesByName('check:cone-opening').length > 0
        && !document.documentElement.dataset.coneStage);
      const painted = await page.evaluate(() => ({
        covered: performance.getEntriesByName('check:cone-arriving')[0]?.startTime,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      }));
      assert.ok(painted.covered && painted.firstPaint && painted.firstPaint >= painted.covered, JSON.stringify(painted));
      assert.deepEqual(preloads.sort(), expected);
      assert.deepEqual((await arrivalScripts(page, 'script')).map(e => e.pathname).sort(), expected);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }

  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      let active = false;
      new MutationObserver(() => {
        if (document.documentElement.dataset.voyageStage) active = true;
        else if (active) { active = false; performance.mark('check:voyage-end'); }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-voyage-stage'] });
    });
    await page.goto(origin + '/');
    await page.waitForFunction(() => performance.getEntriesByName('check:voyage-end').length > 0);
    await waitForWarming(page);
    const voyageEnd = await page.evaluate(() => performance.getEntriesByName('check:voyage-end')[0]?.startTime);
    assert.ok(voyageEnd && (await arrivalScripts(page, 'fetch')).every(entry => entry.start > voyageEnd));
  } finally { await page.close(); }
  console.log('Checked four cone pack selections, the idle timeout, Save-Data, and warming after the first home voyage.');
}
