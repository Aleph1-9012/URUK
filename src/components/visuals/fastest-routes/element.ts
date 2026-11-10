import { defineFilm } from '../../plate/controller';
import { FastestRoutesFilm } from './film';
import { createRouteModel } from './math';
import type { RouteRequest, RouteResponse } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-fastest-routes', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const model = createRouteModel();
  const drawing = new FastestRoutesFilm(root, canvas, context, model);
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
    const reason = 'The full-grid fastest-route calculation could not start.';
    model.computation = { kind: 'failed', reason };
    root.setAttribute('data-numerics-error', reason);

    return drawing;
  }

  worker.addEventListener('message', (event: MessageEvent<RouteResponse>) => {
    const response = event.data;

    if (response.kind === 'failed') {
      fail(response.reason);

      return;
    }

    const result = response.result;
    const count = model.N * model.N;

    if (result.centre.source !== model.source || result.centre.distances.length !== count || result.centre.predecessors.length !== count || result.targets.length === 0 || result.tree.offsets.length < 2) {
      fail('The transferred routes do not match this grid.');

      return;
    }

    model.computation = { kind: 'ready', result };
    root.removeAttribute('data-numerics-error');
    root.setAttribute('data-numerics-ready', '');
    worker?.terminate();
    redraw();
  }, { signal });
  worker.addEventListener('error', event => {
    fail(event.message || 'The full-grid fastest-route calculation could not finish.');
  }, { signal });
  worker.addEventListener('messageerror', () => {
    fail('The computed routes could not be transferred.');
  }, { signal });
  const request: RouteRequest = { kind: 'compute' };
  worker.postMessage(request);

  return drawing;
});
