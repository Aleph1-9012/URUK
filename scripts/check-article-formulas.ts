import assert from 'node:assert/strict';
import type { Browser } from 'playwright-core';

export async function checkArticleFormulas(browser: Browser, origin: string) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  });

  try {
    const page = await context.newPage();
    for (const [route, text] of [['238', /𝔼\[∑x∈Hhws\(x\)2𝟏/], ['179', /Lw,S=\(wS−1\)\/\(1\+i\)=/]] as const) {
      await page.goto(`${origin}/results/${route}/`);
      await page.evaluate(() => document.fonts.ready);
      const formula = page.locator('.result-prose .formula-inline').filter({ hasText: text }).first();
      const state = await formula.evaluate(node => {
        const lefts = Array.from(node.querySelectorAll('.formula-inline__piece'), piece => piece.getBoundingClientRect().left);
        const viewport = node.querySelector('[data-formula-viewport]');

        return {
          wraps: lefts.some((left, i) => i > 0 && left <= lefts[i - 1]!),
          scrolls: viewport && getComputedStyle(viewport).overflowX !== 'visible',
          hint: node.hasAttribute('data-overflow'),
        };
      });

      assert.deepEqual(state, { wraps: true, scrolls: false, hint: false }, route);
    }

    await page.goto(`${origin}/results/003/`);
    await page.evaluate(() => document.fonts.ready);
    const prose = page.locator('.result-prose p').filter({ hasText: 'the field obtained by adjoining' }).first();
    const compounds = await prose.locator('.formula-inline__piece').allTextContents();
    assert.ok(compounds.some(text => text === 'L-function'));
    const margins = await prose.locator('msqrt').evaluateAll(roots => roots.slice(0, 2)
      .map(root => Number.parseFloat(getComputedStyle(root).marginInlineEnd)));
    assert.ok(margins.length === 2 && margins.every(margin => margin < 0), margins.join(', '));
    const size = await page.locator('.result-prose .formula-inline--article mfrac > *').first().evaluate(part => {
      const parent = part.parentElement;
      if (!parent) throw new Error('Expected a fraction');
      return Number.parseFloat(getComputedStyle(part).fontSize) / Number.parseFloat(getComputedStyle(parent).fontSize);
    });
    assert.ok(Math.abs(size - .8) < .01, String(size));

    await page.goto(`${origin}/results/350/`);
    const displayRoots = await page.locator('.result-prose uruk-formula msqrt').evaluateAll(roots => roots
      .map(root => Number.parseFloat(getComputedStyle(root).marginInlineEnd)));
    assert.ok(displayRoots.length >= 2 && displayRoots.every(margin => margin < 0));
    const filmRoots = await page.locator('.film-host msqrt').evaluateAll(roots => roots
      .map(root => Number.parseFloat(getComputedStyle(root).marginInlineEnd)));
    assert.ok(filmRoots.length && filmRoots.every(margin => margin === 0));
    console.log('Article formulas wrap, keep attached prose, and correct radical advance in inline and display math only.');
  } finally { await context.close(); }
}
