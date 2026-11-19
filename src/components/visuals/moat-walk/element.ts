import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { MoatWalkFilm } from './film';
import { TIMELINE } from './story';
import type { MoatWorkerMessage } from './data';

defineFilm('uruk-moat-walk', TIMELINE, (film) => {
  const drawing = new MoatWalkFilm(film.root, film.context);

  runNumerics<MoatWorkerMessage>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(message, numerics) {
      if (message.kind === 'error') {
        numerics.fail(message.message);

        return;
      }

      if (message.kind === 'complete') {
        numerics.ready();
        film.redraw();
      } else drawing.setData(message);
    },
    cannotFinish: 'The numerical calculation could not finish.',
  });

  return drawing;
});
