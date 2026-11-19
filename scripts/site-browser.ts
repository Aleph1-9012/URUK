import { readdir, readFile } from 'node:fs/promises';
import { preview } from 'astro';
import { chromium, type Browser, type Page } from 'playwright-core';

/** The browser checks share one preview port, so only one of them can run at a time. */
const PREVIEW_PORT = 4322;
const CHROMIUM_PATH = '/usr/bin/chromium';

/** Ordinary films are ready immediately; worker films must finish or report their failure. */
export async function waitForNumerics(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return document.querySelector('.film-host:is([data-ready], [data-numerics-error])') !== null;
  }, undefined, { timeout: 60000 });
  const error = await page.locator('.film-host').getAttribute('data-numerics-error');

  if (error !== null) throw new Error(`Film calculation failed: ${error}`);
}

/** Serves the built site, opens Chromium, and closes both once `run` settles. */
export async function withSiteBrowser<Result>(run: (browser: Browser, origin: string) => Promise<Result>): Promise<Result> {
  const server = await preview({ root: process.cwd(), server: { host: '127.0.0.1', port: PREVIEW_PORT }, logLevel: 'error' });
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({ executablePath: CHROMIUM_PATH, headless: true });

    return await run(browser, `http://127.0.0.1:${server.port}`);
  } finally {
    try {
      await browser?.close();
    } finally {
      await server.stop();
    }
  }
}

/** Routes of the built result pages that carry a narrated film. */
export async function filmRoutes(): Promise<string[]> {
  const routes: string[] = [];

  for (const entry of await readdir('dist/results', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const html = await readFile(`dist/results/${entry.name}/index.html`, 'utf8');

    if (html.includes('data-film-range')) routes.push(`/results/${entry.name}/`);
  }

  return routes.sort();
}
