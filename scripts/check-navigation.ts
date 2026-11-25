import assert from 'node:assert/strict';
import type { Browser, Page } from 'playwright-core';

const source = '/results/003/';
const next = '/results/004/';

async function waitForWall(page: Page) {
  await page.waitForFunction(() => {
    const id = sessionStorage.getItem('uruk:cone-staged');
    return id && !id.startsWith('building:');
  });
}

async function follow(page: Page, path: string) {
  await page.evaluate(path => {
    const link = Array.from(document.links).find(a => a.getAttribute('href') === path && !a.target && !a.hasAttribute('download'));
    if (link) { link.click(); return; }
    const anchor = document.createElement('a');
    anchor.href = path;
    document.body.append(anchor);
    anchor.click();
  }, path);
  await page.waitForURL(url => url.pathname === path);
}

export async function checkPageNavigation(browser: Browser, origin: string) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const stages: string[] = [];
    page.on('console', message => {
      if (message.text().startsWith('navigation-stage ')) stages.push(message.text().slice(17));
    });
    await page.addInitScript(() => {
      const observe = new MutationObserver(records => {
        for (const record of records) {
          const name = record.attributeName;
          if (!name) continue;
          const stage = document.documentElement.getAttribute(name);
          if (stage) console.debug('navigation-stage ' + name + '/' + stage);
        }
      });
      observe.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-count-stage','data-cone-stage'] });
      window.addEventListener('pageshow', event => { if (event.persisted) document.documentElement.dataset.restoredForCheck = 'true'; });
    });

    const journeys = [
      ['/', '/about/', 'cone'], ['/', source, 'cone'], ['/about/', '/how-we-check/', 'cone'],
      ['/how-we-check/', '/results/', 'cone'], ['/results/', source, 'count'],
      [source, next, 'count'], [next, source, 'count'], [source, '/results/', 'cone'],
      [source, '/', 'cone'], ['/results/', '/about/', 'cone'], ['/about/', '/404.html', 'cone'],
      ['/404.html', '/', 'cone'],
    ] as const;
    for (const [from, to, owner] of journeys) {
      await page.goto(origin + from);
      await page.evaluate(() => localStorage.setItem('uruk:voyage-seen','1'));
      await waitForWall(page);
      stages.length = 0;
      await follow(page, to);
      await page.waitForFunction(() => !document.documentElement.dataset.countStage && !document.documentElement.dataset.coneStage);
      assert.ok(stages.includes('data-' + owner + '-stage/opening'), from + ' → ' + to + ': ' + stages);
      assert.ok(stages.every(stage => stage.startsWith('data-' + owner + '-stage/')));
      if (from === '/about/' && to === '/how-we-check/') {
        await page.evaluate(() => history.back());
        await page.waitForURL(origin + from, { waitUntil: 'commit' });
        await page.waitForFunction(() => document.documentElement.dataset.restoredForCheck === 'true');
        assert.equal(await page.locator('#cone-head-face,.cone-wall:visible').count(), 0);
        await page.evaluate(() => history.forward());
        await page.waitForURL(origin + to, { waitUntil: 'commit' });
        assert.equal(await page.locator('#cone-head-face,.cone-wall:visible').count(), 0);
      }
    }

    await page.goto(origin + '/about/');
    await waitForWall(page);
    const guards = await page.evaluate(() => {
      const results: boolean[] = [];
      function check(href: string, options: MouseEventInit = {}, target = '', download = false) {
        const a = document.createElement('a');
        a.href = href; a.target = target;
        if (download) a.download = 'article';
        document.body.append(a);
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
        window.addEventListener('click', e => { results.push(e.defaultPrevented); e.preventDefault(); }, { once: true });
        a.dispatchEvent(event);
        a.remove();
      }
      for (const key of ['metaKey','ctrlKey','altKey','shiftKey']) check('/how-we-check/', { [key]: true });
      check('/how-we-check/', { button: 1 }); check('/how-we-check/', {}, '_blank'); check('/how-we-check/', {}, '', true);
      check('#top'); check('/about/'); check('https://example.org/'); check('/fonts/special-elite-regular.woff2');
      return results;
    });
    assert.ok(guards.length === 11 && guards.every(prevented => !prevented));

    await page.evaluate(() => localStorage.removeItem('uruk:voyage-seen'));
    stages.length = 0;
    await follow(page, '/');
    await page.waitForFunction(() => !document.documentElement.dataset.coneStage);
    assert.ok(stages.includes('data-cone-stage/opening'));
    assert.equal(await page.evaluate(() => localStorage.getItem('uruk:voyage-seen')), '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(origin + '/about/');
    stages.length = 0;
    await follow(page, '/how-we-check/');
    await page.waitForFunction(() => !document.documentElement.dataset.coneStage);
    assert.ok(stages.includes('data-cone-stage/pressing'));
    assert.ok(stages.includes('data-cone-stage/opening'));

    await page.goto(origin + '/results/');
    stages.length = 0;
    await follow(page, source);
    assert.deepEqual(stages, []);
    await page.reload();
    assert.equal(await page.locator('#cone-head-face,.cone-wall:visible').count(), 0);
  } finally { await context.close(); }
}
