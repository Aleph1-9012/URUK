import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { SilentLinesFilm } from './film';
import { TIMELINE } from './story';
import type { SilentWorkerMessage } from './transport';

defineFilm('uruk-silent-lines', TIMELINE, (film) => {
  const drawing = new SilentLinesFilm(film.root, film.context);

  runNumerics<SilentWorkerMessage>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(message, numerics) {
      if (message.kind === 'error') {
        numerics.fail(message.message);

        return;
      }

      drawing.setData(message);

      if (message.kind === 'complete') numerics.ready();

      film.redraw();
    },
    onFailure: (message) => drawing.setData({ kind: 'error', message }),
    cannotFinish: 'The numerical calculation could not finish.',
  });

  return drawing;
});
