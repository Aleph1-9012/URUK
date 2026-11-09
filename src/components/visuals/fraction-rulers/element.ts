import { defineFilm } from '../../plate/controller';
import { FractionRulersFilm } from './film';
import { TIMELINE } from './story';
import type { SeriesMessage } from './worker';

defineFilm('uruk-fraction-rulers', TIMELINE, ({ canvas, labels, signal, redraw }) => {
  const drawing = new FractionRulersFilm(canvas, labels);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  signal.addEventListener('abort', () => worker.terminate(), { once: true });
  worker.addEventListener('message', (event: MessageEvent<SeriesMessage>) => {
    if (event.data.kind !== 'series') return;

    drawing.setSeries(event.data.data);
    redraw();
  }, { signal });

  return drawing;
});
