(() => {
  const root = document.documentElement;
  const config = document.getElementById('cone-config').dataset;
  const key = 'uruk:cone-destination';
  let worker;
  let deadline;
  let frame;
  let nextScript;

  function clear() {
    clearTimeout(deadline);
    cancelAnimationFrame(frame);
    if (nextScript) URL.revokeObjectURL(nextScript);
    nextScript = undefined;
    delete window.urukPaintConePart;
    delete root.dataset.coneStage;
    delete root.dataset.coneLoading;
    delete root.dataset.coneLayoutReady;
    delete root.dataset.coneOverlayScrollbar;
    document.dispatchEvent(new Event('uruk:cone-discard'));
    document.getElementById('cone-head-face')?.remove();
    if (worker) worker.postMessage({ type: 'dispose' });
  }

  let module;
  function decodeFace(text, width, height) {
    const input = Uint8Array.fromBase64(text);
    const size = width * height * 4;
    const offset = Math.ceil(input.length / 16) * 16;
    const memory = new WebAssembly.Memory({ initial: Math.ceil((size + offset) / 65536) });
    const bytes = new Uint8Array(memory.buffer, 0, input.length);
    bytes.set(input);
    // Checked LZ4 block decoder compiled from data/decode.c.
    module ??= new WebAssembly.Module(Uint8Array.fromBase64('AGFzbQEAAAABCQFgBH9/f38BfwIPAQNlbnYGbWVtb3J5AgAAAwIBAAQFAXABAQEHCgEGZGVjb2RlAAAKzgMBywMBB38CQCABRQ0AIAIgA2ohBCAAIAFqIQUgAiEGA0AgAEEBaiEBAkACQCAALQAAIgdBBHYiA0EPRg0AIAEhCAwBC0EPIQMDQCABIAVGDQMgA0GAgICAB0sNAyADIAEtAAAiCWohAyABQQFqIgghASAJQf8BRg0ACwsgAyAFIAhrSg0BIAMgBCAGa0oNAQJAIANFDQAgBiAIIAP8CgAACyAGIANqIQYCQCAIIANqIgMgBUcNACAGIARGDwsgBSADa0ECSA0BIAMvAAAiAUUNASABIAYgAmtLDQEgA0ECaiEDAkACQCAHQQ9xIglBD0YNACADIQAMAQtBDyEJA0AgAyAFRg0DIAlBgICAgAdLDQMgCSADLQAAIghqIQkgA0EBaiIAIQMgCEH/AUYNAAsLIAQgBmsgCUEEaiIDSA0BIAYgAWshCgJAAkAgAyABSw0AAkAgA0UNACAGIAogA/wKAAALIAYgA2ohBgwBCwNAIAYhCSADIQgCQCABRQ0AIAkgCiAB/AoAAAsgCCABayEDIAkgAWohBiABQQF0IgchASADIAdLDQALAkAgA0UNACAGIAogA/wKAAALIAkgCGohBgsgACAFSQ0ACwtBAAs='));
    const codec = new WebAssembly.Instance(module, { env: { memory } });
    if (!codec.exports.decode(0, bytes.length, offset, size)) throw new Error('Incomplete cone face');
    return new ImageData(new Uint8ClampedArray(memory.buffer, offset, size), width, height);
  }

  try {
    const saved = window.urukConeIntent;
    delete window.urukConeIntent;
    const rebuild = window.urukRebuiltCone;
    delete window.urukRebuiltCone;
    delete window.urukConeName;
    if (!saved && !rebuild) return;
    const intent = saved && JSON.parse(saved);
    if (!rebuild) {
      sessionStorage.removeItem(key);
      const { to, expires, token, stripes } = intent;
      if (token !== sessionStorage.getItem('uruk:cone-staged') || to !== location.href
        || expires <= Date.now() || performance.getEntriesByType('navigation')[0]?.type !== 'navigate' || stripes !== 8) { clear(); return; }
    }
    const layout = rebuild ? rebuild.layout : intent.layout;
    const stripes = 8;
    if (root.dataset.countStage || layout.width !== root.clientWidth || layout.height !== innerHeight
      || layout.dpr !== devicePixelRatio) { clear(); return; }
    const width = Math.round(layout.width * layout.density);
    const height = Math.round(layout.height * layout.density);
    const canvas = document.createElement('canvas');
    canvas.id = 'cone-head-face';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = width;
    canvas.height = height;
    // Gecko can briefly clear a bitmaprenderer at document replacement. Paint
    // its retained 2D surface directly before allowing the parser to continue.
    const bitmap = /Gecko\/\d/.test(navigator.userAgent) ? null : canvas.getContext('bitmaprenderer');
    const backing = bitmap ? new OffscreenCanvas(width, height) : canvas;
    const paper = backing.getContext('2d', { willReadFrequently: !bitmap });
    if (!paper) { clear(); return; }
    paper.globalCompositeOperation = 'copy';
    const step = Math.ceil(height / stripes);
    let index = 0;
    let prepared = false;
    let domReady = document.readyState !== 'loading';
    if (window.ResizeObserver) {
      const size = new ResizeObserver(([entry]) => {
        const actual = entry.devicePixelContentBoxSize?.[0]?.inlineSize;
        size.disconnect();
        if (actual && Math.abs(Math.max(actual,Math.round(layout.width*layout.dpr))-width) > 1) clear();
      });
      try { size.observe(root, {box:'device-pixel-content-box'}); } catch { size.disconnect(); }
    }
    let starting = false;
    let flying = false;
    let latest = 0;
    let firstPosePending = false;
    const phone = matchMedia('(max-width: 47.999rem), (max-height: 34rem) and (pointer: coarse)').matches;
    const duration = phone ? 380 : 570;
    const firstPoseMs = 1000 / 60;
    root.toggleAttribute('data-cone-overlay-scrollbar', root.clientWidth === innerWidth);
    root.dataset.coneLoading = '';
    deadline = setTimeout(clear, 15000);

    function draw(progress) {
      latest = progress;
      if (flying || root.dataset.coneStage !== 'opening') return;
      flying = true;
      worker.postMessage({ type: 'draw', progress });
    }

    function advance(now, start) {
      if (root.dataset.coneStage !== 'opening') return;
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      draw(progress);
      if (progress < 1) frame = requestAnimationFrame(t => advance(t, start));
    }
    function open() {
      if (starting || !prepared || !domReady || root.dataset.coneStage !== 'arriving') return;
      starting = true;
      root.dataset.coneLayoutReady = '';
      frame = requestAnimationFrame(() => {
        if (root.dataset.coneStage !== 'arriving') return;
        root.dataset.coneStage = 'opening';
        // Keep the wall intact while the renderer draws its first moving pose.
        // Start the remaining motion when that pose reaches the visible canvas.
        firstPosePending = true;
        draw(firstPoseMs / duration);
      });
    }

    function ready() { domReady = true; open(); }
    document.addEventListener('DOMContentLoaded', ready, { once: true });
    document.addEventListener('uruk:result-opening-ready', ready, { once: true });
    worker = new Worker(config.worker, { type: 'module' });
    worker.onerror = () => { clear(); worker.terminate(); };
    worker.onmessage = ({ data }) => {
      if (data.type === 'disposed') { worker.terminate(); return; }
      if (data.type === 'unavailable') { clear(); return; }
      if (data.type === 'ready') { prepared = true; open(); return; }
      if (data.type !== 'painted') return;
      if (root.dataset.coneStage !== 'opening') { data.frame.close(); return; }
      if (bitmap) bitmap.transferFromImageBitmap(data.frame);
      else {
        paper.drawImage(data.frame, 0, 0);
        data.frame.close();
      }
      flying = false;
      if (firstPosePending) {
        firstPosePending = false;
        frame = requestAnimationFrame(t => {
          const start = t - firstPoseMs;
          frame = requestAnimationFrame(now => advance(now, start));
        });
      } else if (data.progress >= 1) clear();
      else if (latest > data.progress) draw(latest);
    };
    worker.postMessage({ type: 'prime', buildMesh: Boolean(rebuild), atlas: new URL(config.atlas, location.href).href, layout });

    function readPart(prefix) {
      const part = prefix + index;
      const text = sessionStorage.getItem(part);
      if (text === null) throw new Error('Missing cone artwork');
      sessionStorage.removeItem(part);
      return text;
    }
    function paintPixels(text, w, h, x, y) {
      const pixels = decodeFace(text, w, h);
      sendPixels(pixels, x, y);
    }
    function sendPixels(pixels, x, y) {
      paper.putImageData(pixels, x, y);
      // Both painters receive the decoded asset, including its type, without sampling the page.
      const copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
      worker.postMessage({ type: 'pixels', x, y, image: copy }, [copy.data.buffer]);
    }

    const instruction = new Blob(['window.urukPaintConePart?.()'], { type: 'text/javascript' });
    function scheduleStripe() {
      nextScript = URL.createObjectURL(instruction);
      document.write('<script blocking="render" src="' + nextScript + '"><' + '/script>');
    }
    window.urukPaintConePart = () => {
      URL.revokeObjectURL(nextScript);
      nextScript = undefined;
      try {
        const y = index * step;
        const chunk = readPart('uruk:cone-mesh-');
        worker.postMessage({ type: 'mesh', chunk, last: index + 1 === stripes });
        paintPixels(readPart('uruk:cone-face-'), width, Math.min(step, height - y), 0, y);
        if (++index < stripes) { scheduleStripe(); return; }
        const label = intent.label;
        paintPixels(label.text, label.width, label.height, label.x, label.y);
        sessionStorage.removeItem('uruk:cone-staged');
        attach();
      } catch { clear(); }
    };
    function attach() {
      delete window.urukPaintConePart;
      delete root.dataset.coneLoading;
        if (bitmap) {
          bitmap.transferFromImageBitmap(backing.transferToImageBitmap());
          backing.width = backing.height = 0;
        }
        root.append(canvas);
        root.dataset.coneStage = 'arriving';
        worker.postMessage({ type: 'face' });
    }
    if (rebuild) {
      sendPixels(rebuild.pixels, 0, 0);
      attach();
    } else scheduleStripe();
  } catch { clear(); }

  document.addEventListener('uruk:cone-depart', () => {
    if (root.dataset.coneStage === 'arriving' || root.dataset.coneStage === 'opening') clear();
  }, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) clear(); });
})();
