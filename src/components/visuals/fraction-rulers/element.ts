import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { FractionRulersFilm } from './film';
import { TIMELINE } from './story';
import type { SeriesMessage } from './worker';

defineFilm('uruk-fraction-rulers', TIMELINE, (film) => {
  const drawing = new FractionRulersFilm(film.canvas, film.labels);

  runNumerics<SeriesMessage>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(message, numerics) {
      if (message.kind !== 'series') return;

      drawing.setSeries(message.data);
      numerics.ready();
      film.redraw();
    },
  });

  return drawing;
});
