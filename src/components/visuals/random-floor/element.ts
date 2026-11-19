import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { RandomFloorFilm } from './film';
import type { CalculationRequest, CalculationResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-random-floor', TIMELINE, (film) => {
  const drawing = new RandomFloorFilm(film.root, film.context);
  const worker = runNumerics<CalculationResult>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(result, numerics) {
      if (result.kind === 'failed') {
        numerics.fail(result.message);

        return;
      }

      drawing.setData(result.data);
      numerics.ready();
      worker?.terminate();
      film.redraw();
    },
    cannotStart: 'The homomorphism calculation could not start.',
    cannotFinish: 'The homomorphism calculation could not finish.',
    cannotTransfer: 'The computed graph densities could not be transferred.',
  });
  const request: CalculationRequest = { kind: 'calculate' };
  worker?.postMessage(request);

  return drawing;
});
