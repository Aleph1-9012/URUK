import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { PolymerWalkFilm } from './film';
import { createPolymerModel } from './math';
import type { CountsRequest, CountsResult } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-polymer-walk', TIMELINE, (film) => {
  const model = createPolymerModel();
  const drawing = new PolymerWalkFilm(film.root, film.context, model);
  const worker = runNumerics<CountsResult>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(result, numerics) {
      model.counts.splice(0, model.counts.length, ...result.counts);
      numerics.ready();
      film.redraw();
    },
    cannotFinish: 'The longer walk count could not finish.',
  });
  const request: CountsRequest = { kind: 'counts', maxLength: 18 };
  worker?.postMessage(request);

  return drawing;
});
