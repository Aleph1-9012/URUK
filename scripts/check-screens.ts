import { spawn } from 'node:child_process';
import { preview } from 'astro';
import { mkdir, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

const REPO_ROOT = process.cwd();
const VIEWPORTS = [
  { name: '320x900', width: 320, height: 900, deviceScaleFactor: 1 },
  { name: '390x900', width: 390, height: 900, deviceScaleFactor: 1 },
  { name: '768x900', width: 768, height: 900, deviceScaleFactor: 1 },
  { name: '1024x900', width: 1024, height: 900, deviceScaleFactor: 1 },
  { name: '1280x900', width: 1280, height: 900, deviceScaleFactor: 1 },
  { name: '1440x900', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: '1920x900', width: 1920, height: 900, deviceScaleFactor: 1 },
  { name: '2560x900', width: 2560, height: 900, deviceScaleFactor: 1 },
  { name: '667x320', width: 667, height: 320, deviceScaleFactor: 1 },
  { name: '667x375', width: 667, height: 375, deviceScaleFactor: 1 },
  { name: '640x400-dsf2', width: 640, height: 400, deviceScaleFactor: 2 },
] as const;
const EXTRA_URLS = ['/results/?q=colour', '/results/?status=under-review', '/results/?q=collatz', '/results/158/?sources=open'];
const PREVIEW_HOST = '127.0.0.1';
const CHROMIUM_PATH = '/usr/bin/chromium';

type LayoutFailure = {
  check: 'A' | 'B' | 'C' | 'D';
  path: string;
  sizes: string;
};

type LayoutResult = {
  scrollWidth: number;
  clientWidth: number;
  failures: LayoutFailure[];
};

async function runCommand(
  command: string,
  args: string[],
  includeDrafts = false,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const env = { ...process.env };

    if (includeDrafts) {
      env.URUK_DRAFTS = '1';
    }

    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      env,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${signal ?? code}`));
    });
  });
}

async function collectHtmlFiles(directory: string, files: string[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await collectHtmlFiles(entryPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath);
    }
  }
}

function routeForFile(distDirectory: string, filePath: string): string {
  const relativePath = relative(distDirectory, filePath).split(sep).join('/');

  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath}`;
}

async function collectPagePaths(distDirectory: string): Promise<string[]> {
  const htmlFiles: string[] = [];
  await collectHtmlFiles(distDirectory, htmlFiles);

  const pagePaths: string[] = [];

  for (const filePath of htmlFiles) {
    pagePaths.push(routeForFile(distDirectory, filePath));
  }

  return pagePaths.sort();
}

function normalizeRequestedPath(pathname: string): string {
  const queryIndex = pathname.indexOf('?');
  const query = queryIndex < 0 ? '' : pathname.slice(queryIndex);
  const route = queryIndex < 0 ? pathname : pathname.slice(0, queryIndex);
  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`;

  if (withLeadingSlash.endsWith('.html')) {
    return `${withLeadingSlash}${query}`;
  }

  const normalizedRoute = withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;

  return `${normalizedRoute}${query}`;
}

function selectPagePaths(
  discoveredPaths: string[],
  requestedPaths: string[],
): string[] {
  if (requestedPaths.length === 0) {
    return discoveredPaths;
  }

  const selectedPaths: string[] = [];

  for (const requestedPath of requestedPaths) {
    const normalizedPath = normalizeRequestedPath(requestedPath);

    if (!discoveredPaths.includes(normalizedPath)) {
      throw new Error(`Requested page is not in dist: ${normalizedPath}`);
    }

    if (!selectedPaths.includes(normalizedPath)) {
      selectedPaths.push(normalizedPath);
    }
  }

  return selectedPaths;
}

function pageSlug(pathname: string): string {
  const queryIndex = pathname.indexOf('?');
  const route = queryIndex < 0 ? pathname : pathname.slice(0, queryIndex);
  const query =
    queryIndex < 0
      ? ''
      : `-${pathname.slice(queryIndex + 1).replace(/[^a-z0-9]+/gi, '-')}`;
  const slug = route.replace(/^\/+|\/+$/g, '').replaceAll('/', '-');

  return `${slug || 'index'}${query}`;
}

async function inspectPage(page: Page): Promise<LayoutResult> {
  return page.evaluate(async () => {
    const root = document.documentElement;
    const failures: LayoutFailure[] = [];
    const watchedOverflow = new Set(['hidden', 'clip', 'scroll', 'auto']);

    function selectorPath(element: Element): string {
      const parts: string[] = [];
      let current: Element | null = element;

      while (current && parts.length < 5) {
        let part = current.tagName.toLowerCase();

        if (current.id) {
          part += `#${current.id}`;
          parts.unshift(part);
          break;
        }

        const firstClass = current.classList.item(0);

        if (firstClass) {
          part += `.${firstClass}`;
        }

        const parent: Element | null = current.parentElement;

        if (parent) {
          let index = 0;

          for (const sibling of parent.children) {
            if (sibling.tagName === current.tagName) {
              index += 1;
            }

            if (sibling === current) {
              break;
            }
          }

          if (index > 1) {
            part += `:nth-of-type(${index})`;
          }
        }

        parts.unshift(part);
        current = parent;
      }

      return parts.join(' > ');
    }

    function hasAncestorAttribute(element: Element, attribute: string): boolean {
      let current: Element | null = element;

      while (current) {
        if (current.hasAttribute(attribute)) {
          return true;
        }

        current = current.parentElement;
      }

      return false;
    }

    function hasBleedDescendant(element: Element): boolean {
      return element.querySelector('[data-bleed]') !== null;
    }

    function checkSnapItems(phase: string): void {
      for (const scroller of document.querySelectorAll<HTMLElement>('[data-scroller]')) {
        const box = scroller.getBoundingClientRect();
        const left = box.left + scroller.clientLeft;
        const top = box.top + scroller.clientTop;
        const right = left + scroller.clientWidth;
        const bottom = top + scroller.clientHeight;

        for (const item of scroller.querySelectorAll('[data-snap-item]')) {
          const rect = item.getBoundingClientRect();

          if (rect.width === 0 || rect.height === 0) {
            continue;
          }

          const inside =
            rect.left >= left - 1 &&
            rect.right <= right + 1 &&
            rect.top >= top - 1 &&
            rect.bottom <= bottom + 1;
          const outside =
            rect.right <= left + 1 ||
            rect.left >= right - 1 ||
            rect.bottom <= top + 1 ||
            rect.top >= bottom - 1;

          if (!inside && !outside) {
            failures.push({
              check: 'D',
              path: `${selectorPath(item)} [${phase}]`,
              sizes: `item=${rect.left.toFixed(1)}..${rect.right.toFixed(1)} scroller=${left.toFixed(1)}..${right.toFixed(1)}`,
            });
          }
        }
      }
    }

    async function scrollOneItem(): Promise<void> {
      for (const scroller of document.querySelectorAll<HTMLElement>('[data-scroller]')) {
        const horizontal = scroller.scrollWidth > scroller.clientWidth;
        const vertical = scroller.scrollHeight > scroller.clientHeight;

        if (!horizontal && !vertical) {
          continue;
        }

        const item = scroller.querySelector('[data-snap-item]');

        if (!item) {
          continue;
        }

        const rect = item.getBoundingClientRect();
        const distance = horizontal ? rect.width : rect.height;

        await new Promise<void>((resolve) => {
          let finished = false;
          let timer = 0;
          const finish = () => {
            if (finished) {
              return;
            }

            finished = true;
            window.clearTimeout(timer);
            resolve();
          };

          timer = window.setTimeout(finish, 2000);
          scroller.addEventListener('scrollend', finish, { once: true });
          scroller.scrollBy({
            left: horizontal ? distance : 0,
            top: horizontal ? 0 : distance,
            behavior: 'instant',
          });
        });
      }
    }

    if (root.scrollWidth > root.clientWidth) {
      failures.push({
        check: 'A',
        path: 'html',
        sizes: `scroll=${root.scrollWidth}x${root.scrollHeight} client=${root.clientWidth}x${root.clientHeight}`,
      });
    }

    for (const element of document.querySelectorAll('*')) {
      // Screen-reader labels deliberately occupy a clipped one-pixel box.
      if (element.classList.contains('visually-hidden')) {
        continue;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const hasWatchedOverflow =
        watchedOverflow.has(style.overflowX) ||
        watchedOverflow.has(style.overflowY);
      const hasEllipsis = style.textOverflow === 'ellipsis';
      const insideScroller = hasAncestorAttribute(element, 'data-scroller');
      const insideBleed = hasAncestorAttribute(element, 'data-bleed');
      const clipsBleed = style.overflowX === 'clip' && hasBleedDescendant(element);

      if (
        !insideScroller &&
        !insideBleed &&
        !clipsBleed &&
        (hasWatchedOverflow || hasEllipsis) &&
        (element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1)
      ) {
        failures.push({
          check: 'B',
          path: selectorPath(element),
          sizes: `scroll=${element.scrollWidth}x${element.scrollHeight} client=${element.clientWidth}x${element.clientHeight}`,
        });
      }

      const isRendered =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;
      const sticksOut =
        rect.left < -1 || rect.right > window.innerWidth + 1;

      if (!insideScroller && !insideBleed && isRendered && sticksOut) {
        failures.push({
          check: 'C',
          path: selectorPath(element),
          sizes: `rect=${rect.left.toFixed(1)}..${rect.right.toFixed(1)} window=${window.innerWidth} size=${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`,
        });
      }
    }

    const positions = Array.from(document.querySelectorAll<HTMLElement>('[data-scroller]'), (node) => ({ node, left: node.scrollLeft, top: node.scrollTop }));

    checkSnapItems('load');
    await scrollOneItem();
    checkSnapItems('after-scroll');

    for (const { node, left, top } of positions) {
      node.scrollTo({ left, top, behavior: 'instant' });
    }

    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      failures,
    };
  });
}

// Full-page capture changes internal scroll offsets in the installed Chromium.
// Capture successive viewports so the screenshots preserve the layout being checked.
async function captureViewports(page: Page, path: string): Promise<void> {
  const { height, viewport } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: window.innerHeight }));
  const steps = Math.ceil(height / viewport);

  for (let index = 0; index < steps; index += 1) {
    await page.evaluate(async (top) => {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const visibleImages: Promise<void>[] = [];

      for (const image of document.images) {
        const bounds = image.getBoundingClientRect();

        if (bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight) {
          visibleImages.push(image.decode());
        }
      }

      await Promise.all(visibleImages);
    }, index * viewport);
    const tile = index === 0 ? path : path.replace('.png', `.part-${index + 1}.png`);
    await page.screenshot({ path: tile, fullPage: false });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

async function runScreenChecks(): Promise<void> {
  await runCommand('bun', ['run', 'build'], true);

  const distDirectory = join(REPO_ROOT, 'dist');
  const discoveredPaths = await collectPagePaths(distDirectory);
  discoveredPaths.push(...EXTRA_URLS);

  if (discoveredPaths.length === 0) {
    throw new Error('No HTML pages were found in dist.');
  }

  const pagePaths = selectPagePaths(discoveredPaths, process.argv.slice(2));
  const server = await preview({ root: REPO_ROOT, server: { host: PREVIEW_HOST, port: 0 }, logLevel: 'error' });
  const port = server.port;
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
    });

    const outputDirectory = join('/tmp/uruk-work/screens', timestamp());
    await mkdir(outputDirectory, { recursive: true });

    let failureCount = 0;

    for (const pathname of pagePaths) {
      for (const viewport of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: {
            width: viewport.width,
            height: viewport.height,
          },
          deviceScaleFactor: viewport.deviceScaleFactor,
          reducedMotion: 'reduce',
        });

        try {
          const page = await context.newPage();
          const pageUrl = `http://${PREVIEW_HOST}:${port}${pathname}`;
          const screenshotPath = join(
            outputDirectory,
            `${pageSlug(pathname)}-${viewport.name}.png`,
          );

          const response = await page.goto(pageUrl, { waitUntil: 'networkidle' });

          if (!response || (!response.ok() && pathname !== '/404.html')) {
            throw new Error(`Unexpected HTTP status for ${pathname}: ${response?.status()}`);
          }
          await page.evaluate(async () => {
            await document.fonts.ready;
          });
          const result = await inspectPage(page);
          await captureViewports(page, screenshotPath);

          for (const failure of result.failures) {
            failureCount += 1;
            console.error(
              `FAIL page=${pathname} viewport=${viewport.name} check=${failure.check} path=${failure.path} ${failure.sizes}`,
            );
          }
        } finally {
          await context.close();
        }
      }
    }

    console.log(
      `Checked ${pagePaths.length * VIEWPORTS.length} viewports, ${failureCount} failure(s). Screenshots: ${outputDirectory}`,
    );

    if (failureCount > 0) {
      process.exitCode = 1;
    }
  } finally {
    try {
      await browser?.close();
    } finally {
      await server.stop();
    }
  }
}

try {
  await runScreenChecks();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
