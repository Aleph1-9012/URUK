import { defineFilm } from '../../plate/controller';
import { MoatWalkFilm } from './film';
import { TIMELINE } from './story';
import type { MoatWorkerMessage } from './data';

defineFilm('uruk-moat-walk', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const drawing = new MoatWalkFilm(root, canvas, context);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  signal.addEventListener('abort', () => worker.terminate(), { once: true });
  worker.addEventListener('message', (event: MessageEvent<MoatWorkerMessage>) => {
    const message = event.data;
    drawing.setData(message);

    if (message.kind === 'complete') root.setAttribute('data-numerics-ready', '');
    if (message.kind === 'error') root.setAttribute('data-numerics-error', message.message);

    redraw();
  }, { signal });
  worker.addEventListener('error', (event) => {
    const message = event.message || 'The numerical calculation could not finish.';
    drawing.setData({ kind: 'error', message });
    root.setAttribute('data-numerics-error', message);
    redraw();
  }, { signal });
  signal.addEventListener('abort', () => {
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });

  return drawing;
});
