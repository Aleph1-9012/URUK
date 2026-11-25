import { defineFilm } from '../../plate/controller';
import { collectFilmLabels } from '../../plate/labels';
import { runNumerics } from '../../plate/numerics';
import { PrimeFilm } from './film';
import { TIMELINE } from './story';
import type { FilmMessage } from './worker';

defineFilm('uruk-prime-waves', TIMELINE, (film) => {
  const drawing = new PrimeFilm(film.canvas, collectFilmLabels(film.root));

  runNumerics<FilmMessage>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(message, numerics) {
      if (message.kind === 'complete') numerics.ready();
      else if (message.kind === 'map') drawing.addMap(message.map);
      else drawing.setWaves(message.table);

      film.redraw();
    },
  });

  return drawing;
});
