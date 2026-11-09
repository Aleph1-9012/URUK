import { defineFilm } from '../../plate/controller';
import { SilentLinesFilm } from './film';
import { TIMELINE } from './story';
import type { SilentWorkerMessage } from './transport';

defineFilm('uruk-silent-lines', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const drawing = new SilentLinesFilm(root, canvas, context);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  signal.addEventListener('abort', () => worker.terminate(), { once: true });
  worker.addEventListener('message', (event: MessageEvent<SilentWorkerMessage>) => {
    const message = event.data;
    drawing.setData(message);

    if (message.kind === 'complete') root.setAttribute('data-numerics-ready', '');
    if (message.kind === 'error') root.setAttribute('data-numerics-error', message.message);

    redraw();
  }, { signal });
  worker.addEventListener('error', (event) => {
    root.setAttribute('data-numerics-error', event.message || 'The numerical calculation could not finish.');
    redraw();
  }, { signal });
  signal.addEventListener('abort', () => {
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });

  return drawing;
});
