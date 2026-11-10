import { defineFilm } from '../../plate/controller';
import { WarmSpotFilm } from './film';
import { createWarmModel } from './math';
import type { HeatRequest, HeatResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-warm-spot', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const model = createWarmModel();
  const drawing = new WarmSpotFilm(root, canvas, context, model);
  let worker: Worker | null = null;
  root.removeAttribute('data-numerics-ready');
  root.removeAttribute('data-numerics-error');
  signal.addEventListener('abort', () => {
    worker?.terminate();
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });

  function fail(reason: string): void {
    model.computation = { kind: 'failed', reason };
    root.removeAttribute('data-numerics-ready');
    root.setAttribute('data-numerics-error', reason);
    worker?.terminate();
    redraw();
  }

  try {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  } catch {
    const reason = 'The insulated-grid heat calculation could not start.';
    model.computation = { kind: 'failed', reason };
    root.setAttribute('data-numerics-error', reason);

    return drawing;
  }

  worker.addEventListener('message', (event: MessageEvent<HeatResult>) => {
    const result = event.data;

    if (result.kind === 'failed') {
      fail(result.reason);

      return;
    }

    const atlas = result.atlas;

    if (atlas.cellCount !== model.cells.length || atlas.times.length < 2 || atlas.values.length !== atlas.times.length * atlas.cellCount) {
      fail('The transferred heat frames do not match this plate.');

      return;
    }

    model.computation = { kind: 'ready', atlas };
    root.removeAttribute('data-numerics-error');
    root.setAttribute('data-numerics-ready', '');
    worker?.terminate();
    redraw();
  }, { signal });
  worker.addEventListener('error', event => {
    fail(event.message || 'The insulated-grid heat calculation could not finish.');
  }, { signal });
  worker.addEventListener('messageerror', () => {
    fail('The computed heat frames could not be transferred.');
  }, { signal });
  const request: HeatRequest = { kind: 'compute' };
  worker.postMessage(request);

  return drawing;
});
