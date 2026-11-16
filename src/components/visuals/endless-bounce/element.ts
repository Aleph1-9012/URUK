import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { EndlessBounceFilm } from './film';
import { createBounceModel } from './math';
import type { BounceRequest, BounceResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-endless-bounce', TIMELINE, (film) => {
  const model = createBounceModel();
  const drawing = new EndlessBounceFilm(film.root, film.context, model);
  const worker = runNumerics<BounceResult>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(result, numerics) {
      if (result.kind === 'failed') {
        numerics.fail(result.reason);

        return;
      }

      model.computation = { kind: 'ready', cases: result.cases };
      numerics.ready();
      worker?.terminate();
      film.redraw();
    },
    onFailure(reason) {
      model.computation = { kind: 'failed', reason };
    },
    cannotStart: 'The 100000-bounce calculation could not start.',
    cannotFinish: 'The 100000-bounce calculation could not finish.',
    cannotTransfer: 'The computed billiard data could not be transferred.',
  });
  const request: BounceRequest = { kind: 'compute' };
  worker?.postMessage(request);

  return drawing;
});
