import assert from 'node:assert/strict';
import type { Browser } from 'playwright-core';

export async function checkSources(browser: Browser, origin: string): Promise<void> {
  for (const [width, height, deviceScaleFactor] of [[1440, 900, 1], [1024, 900, 1], [390, 844, 3], [320, 568, 3], [667, 320, 1]] as const) {
    const phone = width < 768;
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor, isMobile: phone, hasTouch: phone, reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const sources = page.locator('uruk-sources');
    const panel = sources.locator('.sources-panel');
    const toggle = sources.locator('.sources-toggle');
    const table = sources.locator('.sources-table');
    const preview = sources.locator('.sources-preview');
    const press = () => phone ? toggle.tap() : toggle.click();
    const moving = () => panel.getAttribute('data-moving');
    const visibleHeight = () => panel.evaluate(element => {
      const sheet = element.querySelector('.sources-table');
      const edge = element.querySelector('.sources-edge');
      if (!sheet || !edge) throw new Error('Missing moving Sources edge');
      return edge.getBoundingClientRect().bottom - sheet.getBoundingClientRect().top;
    });
    const halfWay = () => panel.evaluate(element => {
      const animations = element.getAnimations({ subtree: true });
      if (!animations.length) throw new Error('No running Sources animation');
      for (const animation of animations) {
        const duration = animation.effect?.getComputedTiming().duration;
        if (typeof duration !== 'number') throw new Error('No Sources duration');
        animation.pause();
        animation.currentTime = duration / 2;
      }
    }).then(visibleHeight);

    async function settled(open: boolean): Promise<void> {
      await sources.locator('.sources-panel:not([data-moving])').waitFor();
      assert.equal(await toggle.getAttribute('aria-expanded'), String(open));
      assert.equal(await toggle.locator('[data-sources-label]').textContent(), open ? 'Show fewer' : 'Show all 25 sources');
      assert.equal(await toggle.locator('[data-sources-open]').isVisible(), !open);
      assert.equal(await toggle.locator('[data-sources-close]').isVisible(), open);
      assert.equal(await preview.isVisible(), !open);
      assert.equal(await table.isVisible(), open);
      assert.equal(await panel.evaluate((element) => element.style.height), '');
      assert.equal(await panel.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
      assert.equal(await table.getAttribute('inert'), null);
    }

    try {
      await page.goto(`${origin}/results/378/`);
      await page.evaluate(() => document.fonts.ready);
      await settled(false);
      await press();
      assert.equal(await moving(), '');
      await settled(true);

      await toggle.evaluate((element) => {
        element.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      for (const open of [false, true]) {
        assert.ok(await panel.evaluate(element => element.getBoundingClientRect().top < 0));
        const samples = await toggle.evaluate(button => new Promise<{ drift: number; scroll: number; height: number; moving: boolean }[]>(resolve => {
          const panel = button.previousElementSibling;
          const footer = document.querySelector('[data-page-footer]');
          if (!panel || !footer) throw new Error('Missing Sources panel or footer');
          const y = button.getBoundingClientRect().top;
          const footerY = footer.getBoundingClientRect().top;
          const frames: { drift: number; scroll: number; height: number; moving: boolean }[] = [];
          const sample = () => {
            const moving = panel.hasAttribute('data-moving');
            frames.push({
              drift: Math.max(Math.abs(button.getBoundingClientRect().top - y), Math.abs(footer.getBoundingClientRect().top - footerY)),
              scroll: window.scrollY,
              height: panel.getBoundingClientRect().height,
              moving,
            });
            if (moving) requestAnimationFrame(sample);
            else resolve(frames);
          };

          button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          requestAnimationFrame(sample);
        }));
        const during = samples.filter(sample => sample.moving);
        assert.ok(during.length > 4, `${width}: the panel must move over several frames`);
        const maxDrift = Math.max(...samples.map(sample => sample.drift));
        assert.ok(maxDrift <= 1, `${width}: the toggle or footer moved ${maxDrift}px while moving`);
        assert.equal(new Set(during.map(sample => sample.scroll)).size, 1, `${width}: scrolled before commit`);
        assert.equal(new Set(during.map(sample => sample.height)).size, 1, `${width}: laid out a different height before commit`);
        await settled(open);
      }
      await press();
      await settled(false);

      await press();
      const midOpen = await halfWay();
      await press();
      assert.equal(await moving(), '');
      assert.equal(await table.evaluate(element => element.getAnimations().length), 1, `${width}: a second tap must reverse, not cancel`);
      assert.ok(await visibleHeight() <= midOpen + 1);
      await settled(false);

      await press();
      await settled(true);
      await press();
      const midClose = await halfWay();
      await press();
      assert.equal(await moving(), '');
      assert.ok(await visibleHeight() >= midClose - 1);
      await settled(true);
      await press();
      await settled(false);

      const citation = page.locator('a.citation[href="#source-25"]').first();
      await citation.click();
      await page.waitForURL('**/#source-25');
      await settled(true);
      await page.waitForFunction(() => Math.abs((document.querySelector('#source-25')?.getBoundingClientRect().top ?? Infinity) - 24) < 2);
      await page.goto(`${origin}/results/378/#source-25`);
      await settled(true);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await press();
      assert.equal(await moving(), null);
      await settled(false);
      await press();
      assert.equal(await moving(), null);
      await settled(true);
      console.log(`Sources at ${width}×${height}@${deviceScaleFactor}: opened, closed, reversed both ways and opened instantly from a citation or with reduced motion.`);
    } finally {
      await context.close();
    }
  }
}
