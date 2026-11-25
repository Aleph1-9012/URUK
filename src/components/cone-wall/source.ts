import { blankLayout } from './material';
import pressUrl from './press-worker?worker&url';
import type { ConeEntry } from './entry-types';
import { coldPress } from './cold';
import type { PressRequest, PressReply } from './press-worker';
import { preparation } from './preparation';
import { putPatches } from './raster';

const key = 'uruk:cone-destination';
const stageKey = 'uruk:cone-staged';
const root = document.documentElement;
const phone = matchMedia('(max-width: 47.999rem), (max-height: 34rem) and (pointer: coarse)');

async function afterEntry(): Promise<void> {
  const betweenPages = () => Boolean(root.dataset.voyageStage || root.dataset.countStage || root.dataset.coneStage);
  const settled = !betweenPages() ? Promise.resolve() : new Promise<void>(resolve => {
    const observer = new MutationObserver(() => {
      if (!betweenPages()) { observer.disconnect(); resolve(); }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-voyage-stage', 'data-count-stage', 'data-cone-stage'] });
  });
  const roll = document.querySelector('uruk-roll');
  const arrival = roll ? customElements.whenDefined('uruk-roll').then(() => roll.whenArrivalSettles()) : Promise.resolve();
  await Promise.all([settled, arrival]);
}

function workerReply(worker: Worker, signal: AbortSignal) {
  return new Promise<PressReply>((resolve, reject) => {
    function finish() {
      signal.removeEventListener('abort', abort);
      worker.onmessage = null;
      worker.onerror = null;
    }
    function abort() { finish(); reject(signal.reason); }
    signal.addEventListener('abort', abort, { once: true });
    worker.onerror = () => { finish(); reject(new Error('The cone worker stopped')); };
    worker.onmessage = ({ data }: MessageEvent<PressReply>) => { finish(); resolve(data); };
  });
}

export function installSource(face: HTMLCanvasElement, atlas: HTMLImageElement, cover: HTMLElement, entry: ConeEntry) {
  let job: AbortController | undefined;
  let worker: Worker | undefined;
  let transferred = false;
  let warm: Awaited<ReturnType<typeof prepare>> | undefined;
  let pending: Promise<void> | undefined;
  let active: URL | undefined;
  let primer: ReturnType<typeof coldPress> | undefined;
  let lastPresented = -1;
  let frame = 0;
  let resizeTimer = 0;
  let entryDone = false;
  let visible = true;
  let view = '';

  const dimensions = () => [root.clientWidth, innerHeight, devicePixelRatio, window.urukConePixels?.pixels, window.visualViewport?.scale ?? 1].join('/');
  const discard = () => document.dispatchEvent(new Event('uruk:cone-discard'));

  function replaceTransferredFace() {
    if (!transferred) return;
    const fresh = document.createElement('canvas');
    fresh.setAttribute('data-cone-paper', '');
    face.replaceWith(fresh);
    face = fresh;
    transferred = false;
  }

  function reset(keepFace = false) {
    clearTimeout(resizeTimer);
    cancelAnimationFrame(frame);
    entry.hide();
    job?.abort();
    job = undefined;
    worker?.terminate();
    worker = undefined;
    warm = undefined;
    pending = undefined;
    primer?.remove();
    primer = undefined;
    if (!keepFace) {
      delete root.dataset.coneOverlayScrollbar;
      if (root.dataset.coneStage === 'pressing' || root.dataset.coneStage === 'covered') delete root.dataset.coneStage;
      replaceTransferredFace();
      face.width = 0;
      face.height = 0;
      discard();
    }
    active = undefined;
  }

  async function prepare(signal: AbortSignal) {
    const layout = blankLayout();
    const { prepareType, inscription, encodeLabelPatch } = await import('./label');
    signal.throwIfAborted();
    const work = preparation(signal);
    const painter = new Worker(pressUrl, { type: 'module' });
    worker = painter;
    const packed = workerReply(painter, signal);
    const width = Math.round(layout.width * layout.density);
    const height = Math.round(layout.height * layout.density);
    replaceTransferredFace();
    face.width = width;
    face.height = height;
    let surface: OffscreenCanvas | undefined;
    try { surface = face.transferControlToOffscreen?.(); } catch { /* The visible canvas can receive patches directly. */ }
    transferred = Boolean(surface);
    painter.postMessage({ type: 'prepare', layout, surface } satisfies PressRequest, surface ? [surface] : []);
    const [artwork, type] = await Promise.all([packed, prepareType(layout)]);
    if (artwork.type !== 'prepared') throw new Error('Cannot stage the wall');
    await work.yieldTask();
    const token = crypto.randomUUID?.() ?? String(Date.now()) + '/' + Math.random();
    let cached = false;
    try {
      sessionStorage.setItem(stageKey, 'building:' + token);
      const mesh = new Uint8Array(artwork.mesh).toBase64();
      const chunk = Math.ceil(mesh.length / 32) * 4;
      for (const [i, stripe] of artwork.stripes.entries()) {
        await work.yieldTask();
        sessionStorage.setItem('uruk:cone-face-' + i, new Uint8Array(stripe).toBase64());
        await work.yieldTask();
        sessionStorage.setItem('uruk:cone-mesh-' + i, mesh.slice(i * chunk, (i + 1) * chunk));
      }
      sessionStorage.setItem(stageKey, token);
      cached = true;
    } catch {
      signal.throwIfAborted();
      discard();
    }
    await work.yieldTask();
    let context: CanvasRenderingContext2D | null = null;
    if (artwork.first) {
      replaceTransferredFace();
      face.width = width;
      face.height = height;
      context = face.getContext('2d');
      if (!context) throw new Error('Cannot display the impressions');
      putPatches(context, artwork.first);
    }
    painter.onerror = () => restart();
    painter.onmessage = ({ data }: MessageEvent<PressReply>) => {
      if (data.type === 'failed') restart();
      if (data.type === 'pressed') {
        if (context && data.batch) putPatches(context, data.batch);
        entry.hide();
        primer?.remove();
        primer = undefined;
        lastPresented = Math.floor(data.progress * 48);
      }
    };
    const { band, strip } = artwork;
    return { layout, band, inscription, encodeLabelPatch, type, painter, strip, token, cached };
  }

  function start(directed = false) {
    if (pending || !visible || (!entryDone && !directed)) return;
    const controller = new AbortController();
    job = controller;
    view = dimensions();
    pending = prepare(controller.signal).then(ready => {
      if (!controller.signal.aborted) warm = ready;
    }).catch(() => {
      if (job === controller) {
        pending = undefined;
        worker?.terminate();
        worker = undefined;
        if (active) resizeTimer = window.setTimeout(() => start(true), 32);
      }
    });
  }

  function restart() {
    if (active) {
      job?.abort();
      worker?.terminate();
      warm = undefined;
      pending = undefined;
      start(true);
    } else {
      reset();
      resizeTimer = window.setTimeout(() => start(), 100);
    }
  }

  function close(url: URL, name: string) {
    if (dimensions() !== view && pending) reset();
    root.toggleAttribute('data-cone-overlay-scrollbar', root.clientWidth === innerWidth);
    entry.show();
    active = url;
    lastPresented = -1;
    const duration = phone.matches ? 435 : 900;
    let startTime: number | undefined;
    let readyUsed: typeof warm;
    let destination = url.href;
    let sent = -1;

    function tick(time: number) {
      if (!active) return;
      startTime ??= time;
      const progress = Math.max(0, Math.min(1, (time-startTime)/duration));
      if (!warm) {
        primer?.paint(Math.min(47, Math.floor(progress*48)));
        frame = requestAnimationFrame(tick);
        return;
      }
      if (readyUsed !== warm) {
        readyUsed = warm;
        const label = warm.inscription(name, warm.layout, warm.band, warm.strip, warm.type);
        const from = new URL(location.href);
        from.hash = '';
        try {
          if (!warm.cached || sessionStorage.getItem(stageKey) !== warm.token) throw new Error('No stored wall');
          sessionStorage.setItem(key, JSON.stringify({ from: from.href, to: url.href, expires: Date.now()+15000,
            token: warm.token, layout: label.layout, label: warm.encodeLabelPatch(label.strike), stripes: 8 }));
        } catch {
          discard();
          const clean = url.pathname + url.search + url.hash;
          const data = [from.pathname + from.search, clean, warm.layout.width, warm.layout.height, warm.layout.dpr, Math.round(warm.layout.width*warm.layout.density)];
          const marker = '__uruk_cone=' + encodeURIComponent(JSON.stringify(data));
          destination = url.origin + url.pathname + (url.search ? url.search+'&' : '?') + marker + url.hash;
        }
        warm.painter.postMessage({ type:'inscribe', label:label.strike, beat:label.beat } satisfies PressRequest, [label.strike.alpha.buffer]);
        sent = -1;
      }
      if (progress > sent) {
        warm.painter.postMessage({ type:'press', progress } satisfies PressRequest);
        sent = progress;
      }
      if (progress<1 || lastPresented<47) { frame=requestAnimationFrame(tick); return; }
      primer?.remove();primer=undefined;
      root.dataset.coneStage='covered';
      frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{if(active)location.assign(destination);});});
    }
    // Present the already printed first heads before mounting the viewport canvas.
    frame=requestAnimationFrame(first => {
      startTime=first;
      frame=requestAnimationFrame(now => {
        if (!active) return;
        root.dataset.coneStage='pressing';
        if (!warm) {
          primer=coldPress(cover,blankLayout(),atlas);
          start(true);
        }
        tick(now);
      });
    });
  }

  function invalidate() {
    if (view && dimensions() !== view && !active) restart();
  }
  window.addEventListener('resize', invalidate);
  window.visualViewport?.addEventListener('resize', invalidate);
  screen.orientation?.addEventListener('change', invalidate);
  function watchDpr() {
    matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change', () => {
      invalidate();watchDpr();
    }, {once:true});
  }
  watchDpr();
  window.addEventListener('pagehide', () => {
    visible=false;
    reset(root.dataset.coneStage==='covered');
  });
  window.addEventListener('pageshow', event => {
    visible=true;
    if (event.persisted) {reset();start();}
  });
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), {once:true}));
  void loaded.then(afterEntry).then(() => {entryDone=true;start();});
  return { close, invalidate, interest: () => start(true), releaseForCount: () => reset(), ready: () => Boolean(warm) };
}
