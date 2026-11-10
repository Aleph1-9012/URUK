import { defineFilm } from '../../plate/controller';
import { EndlessBounceFilm } from './film';
import { createBounceModel } from './math';
import type { BounceRequest, BounceResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-endless-bounce', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const model = createBounceModel();
  const drawing = new EndlessBounceFilm(root, canvas, context, model);
  let worker: Worker;

  try {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  } catch {
    const reason = 'The 100000-bounce calculation could not start.';
    model.computation = { kind: 'failed', reason };
    root.setAttribute('data-numerics-error', reason);

    return drawing;
  }

  function fail(reason: string): void {
    model.computation = { kind: 'failed', reason };
    root.removeAttribute('data-numerics-ready');
    root.setAttribute('data-numerics-error', reason);
    worker.terminate();
    redraw();
  }

  worker.addEventListener('message', (event: MessageEvent<BounceResult>) => {
    const result = event.data;

    if (result.kind === 'failed') {
      fail(result.reason);

      return;
    }

    model.computation = { kind: 'ready', cases: result.cases };
    root.removeAttribute('data-numerics-error');
    root.setAttribute('data-numerics-ready', '');
    worker.terminate();
    redraw();
  }, { signal });
  worker.addEventListener('error', event => {
    fail(event.message || 'The 100000-bounce calculation could not finish.');
  }, { signal });
  worker.addEventListener('messageerror', () => {
    fail('The computed billiard data could not be transferred.');
  }, { signal });
  signal.addEventListener('abort', () => {
    worker.terminate();
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });
  const request: BounceRequest = { kind: 'compute' };
  worker.postMessage(request);

  return drawing;
});
