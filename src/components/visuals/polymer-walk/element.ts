import { defineFilm } from '../../plate/controller';
import { PolymerWalkFilm } from './film';
import { createPolymerModel } from './math';
import type { CountsRequest, CountsResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-polymer-walk', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const model = createPolymerModel();
  const drawing = new PolymerWalkFilm(root, canvas, context, model);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const request: CountsRequest = { kind: 'counts', maxLength: 18 };

  worker.addEventListener('message', (event: MessageEvent<CountsResult>) => {
    model.counts.splice(0, model.counts.length, ...event.data.counts);
    root.setAttribute('data-numerics-ready', '');
    redraw();
  }, { signal });
  worker.addEventListener('error', (event) => {
    root.setAttribute('data-numerics-error', event.message || 'The longer walk count could not finish.');
    redraw();
  }, { signal });
  signal.addEventListener('abort', () => {
    worker.terminate();
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });
  worker.postMessage(request);

  return drawing;
});
