import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { TrappedWavesFilm } from './film';
import { TIMELINE } from './story';
import type { WaveWorkerMessage } from './data';

defineFilm('uruk-trapped-waves', TIMELINE, (film) => {
  const drawing = new TrappedWavesFilm(film.root, film.context);

  runNumerics<WaveWorkerMessage>(film, {
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
    cannotFinish: 'The numerical wave data could not be loaded.',
  });

  return drawing;
});
