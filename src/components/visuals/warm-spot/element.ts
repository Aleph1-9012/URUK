import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { WarmSpotFilm } from './film';
import { createWarmModel } from './math';
import type { HeatRequest, HeatResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-warm-spot', TIMELINE, (film) => {
  const model = createWarmModel();
  const drawing = new WarmSpotFilm(film.root, film.context, model);
  const worker = runNumerics<HeatResult>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(result, numerics) {
      if (result.kind === 'failed') {
        numerics.fail(result.reason);

        return;
      }

      const atlas = result.atlas;

      if (atlas.cellCount !== model.cells.length || atlas.times.length < 2 || atlas.values.length !== atlas.times.length * atlas.cellCount) {
        numerics.fail('The transferred heat frames do not match this plate.');

        return;
      }

      model.computation = { kind: 'ready', atlas };
      numerics.ready();
      worker?.terminate();
      film.redraw();
    },
    cannotStart: 'The insulated-grid heat calculation could not start.',
    cannotFinish: 'The insulated-grid heat calculation could not finish.',
    cannotTransfer: 'The computed heat frames could not be transferred.',
  });
  const request: HeatRequest = { kind: 'compute' };
  worker?.postMessage(request);

  return drawing;
});
