import { defineFilm } from '../../plate/controller';
import { TrappedWavesFilm } from './film';
import { TIMELINE } from './story';
import type { WaveWorkerMessage } from './data';

defineFilm('uruk-trapped-waves', TIMELINE, ({ root, canvas, context, signal, redraw }) => {
  const drawing = new TrappedWavesFilm(root, canvas, context);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  signal.addEventListener('abort', () => worker.terminate(), { once: true });
  worker.addEventListener('message', (event: MessageEvent<WaveWorkerMessage>) => {
    const message = event.data;
    drawing.setData(message);

    if (message.kind === 'complete') root.setAttribute('data-numerics-ready', '');
    if (message.kind === 'error') root.setAttribute('data-numerics-error', message.message);

    if (message.kind !== 'frame') redraw();
  }, { signal });
  worker.addEventListener('error', (event) => {
    const message = event.message || 'The numerical wave data could not be loaded.';
    drawing.setData({ kind: 'error', message });
    redraw();
  }, { signal });
  signal.addEventListener('abort', () => {
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }, { once: true });

  return drawing;
});
