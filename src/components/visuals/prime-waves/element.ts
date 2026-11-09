import { defineFilm } from '../../plate/controller';
import { PrimeFilm } from './film';
import { TIMELINE } from './story';
import type { FilmMessage } from './worker';

defineFilm('uruk-prime-film', TIMELINE, ({ canvas, labels, signal, redraw }) => {
  const drawing = new PrimeFilm(canvas, labels);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  signal.addEventListener('abort', () => worker.terminate(), { once: true });
  worker.addEventListener('message', (event: MessageEvent<FilmMessage>) => {
    const message = event.data;

    if (message.kind === 'map') drawing.addMap(message.map);
    else drawing.setWaves(message.table);

    redraw();
  }, { signal });

  return drawing;
});
